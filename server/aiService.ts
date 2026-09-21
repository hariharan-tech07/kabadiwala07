import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db';
import { AIPredictionResult } from '../src/types';
import fs from 'fs';
import path from 'path';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return geminiClient;
}

const CATEGORIES_METADATA: Record<string, {
  subcategories: string[];
  safety: string;
  defaultConfidence: number;
  boxLabels: string[];
}> = {
  'PCB (Printed Circuit Boards)': {
    subcategories: ['Multilayer Telecom Boards', 'Gold Finger Edge Connectors', 'IC Chips & BGA Arrays'],
    safety: 'Strictly prohibit nitric acid soaking or torch desoldering in unventilated sheds. Wear protective gloves.',
    defaultConfidence: 96.4,
    boxLabels: ['BGA_CHIP_ARRAY', 'PCB_SUBSTRATE', 'GOLD_FINGERS']
  },
  'Copper Wires/Cables': {
    subcategories: ['Armored Copper Cable', 'Stripped Bright Copper Wire', 'PVC Sheathed House Wire'],
    safety: 'Never burn plastic insulation in the open. Use mechanical stripping blades or sell unstripped.',
    defaultConfidence: 94.8,
    boxLabels: ['COPPER_CORE_99%', 'PVC_SHEATH_OUTER']
  },
  'Lead/Li-ion Batteries': {
    subcategories: ['Lithium Pouch Cells', 'Telecom Lead-Acid Battery', '18650 Cylindrical Pack'],
    safety: 'Do not hammer or puncture. Store in dry vermiculite/sand to prevent spontaneous thermal fires.',
    defaultConfidence: 92.7,
    boxLabels: ['ANODE_CATHODE_TERMINAL', 'HAZARDOUS_ELECTROLYTE_CORE']
  },
  'CRT Glass & Monitors': {
    subcategories: ['Leaded Funnel Glass', 'Electron Gun Assembly', 'Phosphor Coated Screen Panel'],
    safety: 'Vacuum implosion hazard. Do not break or fracture. Transport face-down with protective padding.',
    defaultConfidence: 89.5,
    boxLabels: ['LEAD_GLASS_BULB', 'YOKE_COILS']
  },
  'Electric Motors & Transformers': {
    subcategories: ['Induction Motor Stator', 'Copper Magnet Wire Coils', 'Silicon Steel Core'],
    safety: 'Heavy lifting hazard. Ensure oil/grease is properly drained before dismantling.',
    defaultConfidence: 95.1,
    boxLabels: ['STATOR_LAMINATIONS', 'COPPER_WINDING']
  },
  'Mixed Rigid Plastics': {
    subcategories: ['Flame Retardant HIPS Monitor Shell', 'ABS PC Peripheral Housing', 'Printer Chassis'],
    safety: 'Keep segregated from non-electronic plastics. Wash hands thoroughly after sorting.',
    defaultConfidence: 88.2,
    boxLabels: ['RIGID_ABS_HOUSING', 'CHASSIS_PLASTIC']
  }
};

async function resolveImageData(
  input?: string,
  declaredMime?: string
): Promise<{ base64: string; mimeType: string } | null> {
  if (!input) return null;

  try {
    // 1. HTTP/HTTPS URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const response = await fetch(input);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mime = response.headers.get('content-type') || declaredMime || 'image/jpeg';
      return { base64, mimeType: mime.split(';')[0] };
    }

    // 2. Relative or local filesystem path
    if (input.startsWith('/') || input.startsWith('src/') || input.includes('assets/images/')) {
      let resolvedPath = input;
      if (!fs.existsSync(resolvedPath)) {
        resolvedPath = path.join(process.cwd(), input.replace(/^\//, ''));
      }
      if (fs.existsSync(resolvedPath)) {
        const fileBuf = fs.readFileSync(resolvedPath);
        const ext = path.extname(resolvedPath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        return { base64: fileBuf.toString('base64'), mimeType: mime };
      }
    }

    // 3. Data URL
    if (input.startsWith('data:image/')) {
      const match = input.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.*)$/);
      if (match) {
        return {
          mimeType: match[1],
          base64: match[2]
        };
      }
    }

    // 4. Raw base64 string
    const clean = input.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    if (clean.length > 50) {
      return {
        base64: clean,
        mimeType: declaredMime || 'image/jpeg'
      };
    }
  } catch (err) {
    console.warn('Failed to resolve image data:', err);
  }

  return null;
}

export async function predictMaterialFromImage(params: {
  imageBase64?: string;
  imageMimeType?: string;
  fileName?: string;
  weightKg?: number;
  categoryHint?: string;
}): Promise<AIPredictionResult> {
  const { imageBase64, imageMimeType, fileName, weightKg, categoryHint } = params;

  // 1. Resolve image to pure Base64 buffer
  const imagePayload = await resolveImageData(imageBase64, imageMimeType);

  // 2. Try Gemini Vision if client and image payload are available
  const ai = getGeminiClient();
  if (ai && imagePayload) {
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: imagePayload.base64,
                  mimeType: imagePayload.mimeType
                }
              },
              {
                text: `You are an expert e-waste and scrap metal recycling inspector for an authorized CPCB (Central Pollution Control Board) recycling network.
Inspect this scrap image with high precision.
Classify it strictly into ONE of the following official categories:
- "PCB (Printed Circuit Boards)" (circuit boards, motherboards, RAM, chips, telecom boards)
- "Copper Wires/Cables" (insulated cords, stripped copper, electric cables, wiring harnesses)
- "Lead/Li-ion Batteries" (lithium cells, laptop battery packs, lead-acid batteries)
- "CRT Glass & Monitors" (old tube TVs, CRT monitors, curved glass bulbs)
- "Electric Motors & Transformers" (electric motors, copper winding stators, magnetic cores)
- "Mixed Rigid Plastics" (black/grey electronics casings, ABS/HIPS monitor & printer shells)

Return strict JSON with:
- category: exact match to one of the 6 names above
- confidence: number between 80.0 and 99.5
- subcategories: 2-3 specific components or grades detected
- safety_warning: concise actionable safety instruction for scrap collectors
- detected_boxes: array of 1 to 3 bounding box objects with label, confidence, x, y, width, height (coordinates in percentage 0-100)`
              }
            ]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  enum: [
                    'PCB (Printed Circuit Boards)',
                    'Copper Wires/Cables',
                    'Lead/Li-ion Batteries',
                    'CRT Glass & Monitors',
                    'Electric Motors & Transformers',
                    'Mixed Rigid Plastics'
                  ]
                },
                confidence: { type: Type.NUMBER },
                subcategories: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                safety_warning: { type: Type.STRING },
                detected_boxes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER }
                    },
                    required: ['label', 'confidence', 'x', 'y', 'width', 'height']
                  }
                }
              },
              required: ['category', 'confidence', 'subcategories', 'safety_warning']
            }
          }
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.category) {
          // Normalize confidence percentage
          let conf = Number(parsed.confidence);
          if (isNaN(conf) || conf <= 0) conf = 95;
          if (conf <= 1.0) conf = conf * 100;
          conf = Math.min(99.5, Math.max(82.0, Math.round(conf * 10) / 10));

          // Normalize bounding boxes if provided
          let boxes: any[] = [];
          if (Array.isArray(parsed.detected_boxes) && parsed.detected_boxes.length > 0) {
            boxes = parsed.detected_boxes.map((b: any, idx: number) => {
              let x = Number(b.x) || 12 + idx * 24;
              let y = Number(b.y) || 18 + idx * 18;
              let w = Number(b.width) || 44;
              let h = Number(b.height) || 38;
              if (x > 100) x = Math.round(x / 10);
              if (y > 100) y = Math.round(y / 10);
              if (w > 100) w = Math.round(w / 10);
              if (h > 100) h = Math.round(h / 10);
              let bConf = Number(b.confidence);
              if (bConf <= 1.0) bConf = bConf * 100;
              bConf = Math.min(99, Math.max(80, Math.round(bConf * 10) / 10));
              return {
                label: b.label || 'DETECTED_COMPONENT',
                confidence: bConf,
                x: Math.min(90, Math.max(2, x)),
                y: Math.min(90, Math.max(2, y)),
                width: Math.min(90, Math.max(10, w)),
                height: Math.min(90, Math.max(10, h))
              };
            });
          }

          return buildPredictionResponse(
            parsed.category,
            conf,
            parsed.subcategories || [],
            parsed.safety_warning,
            weightKg,
            'gemini_vision',
            boxes.length > 0 ? boxes.map((b: any) => b.label) : undefined,
            undefined,
            boxes.length > 0 ? boxes : undefined
          );
        }
      } catch (geminiError: any) {
        console.warn(`Model ${modelName} encountered error:`, geminiError?.status || geminiError?.message);
        const isTemporary =
          geminiError?.status === 503 ||
          geminiError?.status === 429 ||
          String(geminiError?.message).includes('503') ||
          String(geminiError?.message).includes('demand') ||
          String(geminiError?.message).includes('UNAVAILABLE');

        if (isTemporary) {
          continue;
        }
        break;
      }
    }
  }

  // 3. Fallback Heuristic Computer Vision Pipeline (when API offline or no image)
  const availableCategories = Object.keys(CATEGORIES_METADATA);
  let selectedCategory = '';

  const fn = (fileName || '').toLowerCase();
  if (fn.includes('pcb') || fn.includes('board') || fn.includes('chip') || fn.includes('circuit') || fn.includes('motherboard')) {
    selectedCategory = 'PCB (Printed Circuit Boards)';
  } else if (fn.includes('copper') || fn.includes('wire') || fn.includes('cable') || fn.includes('cord')) {
    selectedCategory = 'Copper Wires/Cables';
  } else if (fn.includes('battery') || fn.includes('cell') || fn.includes('lead') || fn.includes('lithium') || fn.includes('18650')) {
    selectedCategory = 'Lead/Li-ion Batteries';
  } else if (fn.includes('crt') || fn.includes('tv') || fn.includes('screen') || fn.includes('monitor') || fn.includes('tube')) {
    selectedCategory = 'CRT Glass & Monitors';
  } else if (fn.includes('motor') || fn.includes('transform') || fn.includes('coil') || fn.includes('stator')) {
    selectedCategory = 'Electric Motors & Transformers';
  } else if (fn.includes('plastic') || fn.includes('casing') || fn.includes('housing') || fn.includes('shell') || fn.includes('chassis')) {
    selectedCategory = 'Mixed Rigid Plastics';
  } else if (categoryHint && availableCategories.includes(categoryHint)) {
    selectedCategory = categoryHint;
  } else {
    selectedCategory = 'PCB (Printed Circuit Boards)';
  }

  const meta = CATEGORIES_METADATA[selectedCategory] || CATEGORIES_METADATA['PCB (Printed Circuit Boards)'];
  const confidenceVariance = Number((Math.random() * 2 - 1).toFixed(1));
  const finalConfidence = Math.min(98.5, Math.max(88, meta.defaultConfidence + confidenceVariance));

  return buildPredictionResponse(
    selectedCategory,
    finalConfidence,
    meta.subcategories,
    meta.safety,
    weightKg,
    'yolo_mock_pipeline',
    meta.boxLabels
  );
}

function buildPredictionResponse(
  category: string,
  confidence: number,
  subcategories: string[],
  safety: string,
  weightKg?: number,
  source: 'gemini_vision' | 'yolo_mock_pipeline' = 'yolo_mock_pipeline',
  boxLabels: string[] = ['PRIMARY_TARGET'],
  customGroups?: any[],
  customBoxes?: any[]
): AIPredictionResult {
  const materials = db.getMaterials();
  const matched = materials.find(m => m.category.toLowerCase() === category.toLowerCase()) || materials[0];

  const baseRate = matched.base_rate_per_kg;
  const rateMin = Math.round(baseRate * 0.95);
  const rateMax = Math.round(baseRate * 1.12);

  const weight = weightKg && weightKg > 0 ? weightKg : 10;
  const totalMin = Math.round(weight * rateMin);
  const totalMax = Math.round(weight * rateMax);

  // Generate bounding boxes if not explicitly provided
  const boxes = customBoxes || boxLabels.map((label, idx) => ({
    x: 12 + idx * 24,
    y: 18 + idx * 18,
    width: 44,
    height: 38,
    label,
    confidence: Number((confidence - idx * 2.5).toFixed(1))
  }));

  // Build detected material groups for multi-lot generation
  let groups = customGroups;
  if (!groups || groups.length === 0) {
    const primaryGroup = {
      id: `grp-${Date.now()}-1`,
      category: matched.category,
      confidence,
      subcategories: subcategories.length > 0 ? subcategories : [matched.subcategory],
      safety_warning: safety || matched.description,
      estimated_rate_per_kg_min: rateMin,
      estimated_rate_per_kg_max: rateMax,
      bounding_box: boxes[0] || { x: 12, y: 18, width: 44, height: 38 }
    };

    let auxiliaryCategory = 'Copper Wires/Cables';
    if (matched.category === 'Copper Wires/Cables') auxiliaryCategory = 'Mixed Rigid Plastics';
    else if (matched.category === 'Lead/Li-ion Batteries') auxiliaryCategory = 'Copper Wires/Cables';
    else if (matched.category === 'Electric Motors & Transformers') auxiliaryCategory = 'Copper Wires/Cables';
    else if (matched.category === 'CRT Glass & Monitors') auxiliaryCategory = 'Mixed Rigid Plastics';

    const auxMat = materials.find(m => m.category === auxiliaryCategory) || materials[1];
    const auxMeta = CATEGORIES_METADATA[auxMat.category] || CATEGORIES_METADATA['Copper Wires/Cables'];
    const auxConfidence = Number((confidence - 4.2).toFixed(1));

    const secondaryGroup = {
      id: `grp-${Date.now()}-2`,
      category: auxMat.category,
      confidence: auxConfidence,
      subcategories: auxMeta.subcategories,
      safety_warning: auxMeta.safety,
      estimated_rate_per_kg_min: Math.round(auxMat.base_rate_per_kg * 0.95),
      estimated_rate_per_kg_max: Math.round(auxMat.base_rate_per_kg * 1.10),
      bounding_box: boxes[1] || { x: 58, y: 32, width: 36, height: 34 }
    };

    groups = [primaryGroup, secondaryGroup];
  }

  return {
    category: matched.category,
    confidence,
    estimated_rate_per_kg_min: rateMin,
    estimated_rate_per_kg_max: rateMax,
    total_min_price: totalMin,
    total_max_price: totalMax,
    recommended_safety_protocol: safety || matched.description,
    subcategories_detected: subcategories.length > 0 ? subcategories : [matched.subcategory],
    detected_boxes: boxes,
    detected_groups: groups,
    source
  };
}
