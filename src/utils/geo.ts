/**
 * Haversine Formula for exact great-circle distance between two geographic coordinates on Earth (in km)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 decimal place precision
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface UserCoords {
  latitude: number;
  longitude: number;
  source: 'gps' | 'ip' | 'preset' | 'manual';
  label?: string;
}

export const PRESET_HUBS: Record<string, UserCoords> = {
  mumbai: {
    latitude: 19.0402,
    longitude: 72.8566,
    source: 'preset',
    label: 'Dharavi / Kurla, Mumbai'
  },
  delhi: {
    latitude: 28.5350,
    longitude: 77.2730,
    source: 'preset',
    label: 'Okhla Hub, New Delhi'
  },
  bengaluru: {
    latitude: 13.0310,
    longitude: 77.5205,
    source: 'preset',
    label: 'Peenya Hub, Bengaluru'
  },
  hyderabad: {
    latitude: 17.4589,
    longitude: 78.4419,
    source: 'preset',
    label: 'Sanathnagar Hub, Hyderabad'
  },
  chennai: {
    latitude: 13.0850,
    longitude: 80.1600,
    source: 'preset',
    label: 'Ambattur Hub, Chennai'
  },
  kolkata: {
    latitude: 22.5958,
    longitude: 88.2636,
    source: 'preset',
    label: 'Howrah Hub, Kolkata'
  },
  pune: {
    latitude: 18.6298,
    longitude: 73.7997,
    source: 'preset',
    label: 'Pimpri-Chinchwad, Pune'
  },
  ahmedabad: {
    latitude: 22.9563,
    longitude: 72.6394,
    source: 'preset',
    label: 'Vatva Hub, Ahmedabad'
  },
  jaipur: {
    latitude: 26.9855,
    longitude: 75.7725,
    source: 'preset',
    label: 'Vishwakarma Hub, Jaipur'
  },
  lucknow: {
    latitude: 26.7825,
    longitude: 80.8920,
    source: 'preset',
    label: 'Transport Nagar, Lucknow'
  }
};

/**
 * Multi-tier accurate location detection:
 * 1. Checks for previously saved user custom pinned location
 * 2. Attempts Browser Hardware GPS with adequate timeout
 * 3. Automatically falls back to client IP Geolocation (e.g. ipwho.is) if GPS is denied or blocked in iframe
 * 4. Falls back to nearest default hub only if all network & GPS lookups fail
 */
export async function detectBrowserLocation(): Promise<UserCoords> {
  // Check if user has explicitly pinned a location previously
  try {
    const saved = localStorage.getItem('kc_user_pinned_coords');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          source: 'manual',
          label: parsed.label || 'User Pinned Location'
        };
      }
    }
  } catch {
    // ignore
  }

  // Tier 1: Try Browser Geolocation with clean promise & generous 10s timeout
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const gpsResult = await new Promise<UserCoords>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const acc = Math.round(position.coords.accuracy || 20);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              source: 'gps',
              label: `Live Browser GPS (±${acc}m)`
            });
          },
          (error) => {
            reject(error);
          },
          { timeout: 10000, enableHighAccuracy: true, maximumAge: 30000 }
        );
      });

      return gpsResult;
    } catch (gpsError: any) {
      console.warn('Browser GPS unavailable or denied (likely iframe permissions policy), attempting IP geolocation:', gpsError.message || gpsError);
    }
  }

  // Tier 2: Automatic IP-based Geolocation Lookup (Fast, highly accurate for city & region)
  try {
    const ipRes = await fetch('https://ipwho.is/');
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const placeName = [data.city, data.region, data.country].filter(Boolean).join(', ');
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip',
          label: `${placeName} (Network IP Location)`
        };
      }
    }
  } catch (ipErr) {
    console.warn('Direct IP geolocation failed, trying server proxy:', ipErr);
    try {
      const serverIpRes = await fetch('/api/geo/ip-lookup');
      if (serverIpRes.ok) {
        const data = await serverIpRes.json();
        if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const placeName = [data.city, data.region, data.country].filter(Boolean).join(', ');
          return {
            latitude: data.latitude,
            longitude: data.longitude,
            source: 'ip',
            label: `${placeName} (Network IP Location)`
          };
        }
      }
    } catch {
      // ignore
    }
  }

  // Fallback default if completely offline
  return PRESET_HUBS.bengaluru;
}
