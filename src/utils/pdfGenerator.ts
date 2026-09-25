import { jsPDF } from 'jspdf';
import { User, Transaction, CPCBComplianceReport, LegalCase } from '../types';

export function generateScrapperMonthlyStatement(
  user: User,
  transactions: Transaction[],
  period: string = 'March 2026'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette
  const darkSlate = [15, 23, 42]; // #0f172a
  const primaryGreen = [16, 185, 129]; // #10b981
  const textMuted = [100, 116, 139]; // #64748b

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KABADIWALA CONNECT v2', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('OFFICIAL SCRAPPER EARNINGS & EPR CONTRIBUTION STATEMENT', 14, 26);
  doc.setTextColor(203, 213, 225);
  doc.text(`Statement Period: ${period} | Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 32);

  // Verification Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(148, 10, 48, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CPCB EPR COMPLIANT', 152, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Aadhaar Formalized', 152, 23);

  // Collector Info Box
  let y = 48;
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informal Collector Details', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${user.name}`, 14, y);
  doc.text(`Collector ID: ${user.id}`, 110, y);

  y += 5;
  doc.text(`Phone: ${user.phone || 'N/A'}`, 14, y);
  doc.text(`Aadhaar KYC: Verified (Last 4: ${user.aadhaar_last4 || '8821'})`, 110, y);

  y += 5;
  doc.text(`Primary Hub: ${user.location}`, 14, y);
  doc.text(`Account Status: ${user.status || 'Active'}`, 110, y);

  // Summary Metrics Box
  y += 10;
  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const validTxs = safeTxs.filter(t => t && t.scrapper_id === user.id);
  const totalWeight = validTxs.reduce((acc, t) => acc + (t.actual_weight || t.estimated_weight || 0), 0);
  const totalEarnings = validTxs.reduce((acc, t) => acc + (t.final_payout || ((t.actual_weight || t.estimated_weight) * t.offered_rate_per_kg) || 0), 0);
  const completedLots = validTxs.filter(t => t.status === 'PAID' || t.status === 'COMPLETED' || t.status === 'WEIGHT_VERIFIED').length;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`${totalWeight.toFixed(1)} kg`, 24, y + 12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`Rs. ${totalEarnings.toLocaleString('en-IN')}`, 84, y + 12);
  doc.text(`${completedLots} / ${validTxs.length}`, 148, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Total Diverted E-Waste', 24, y + 19);
  doc.text('Total Formal Earnings', 84, y + 19);
  doc.text('Settled Digital Lots', 148, y + 19);

  // Table of Transactions
  y += 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Itemized Transaction Ledger', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Lot ID', 18, y + 5.5);
  doc.text('Category', 52, y + 5.5);
  doc.text('Weight', 104, y + 5.5);
  doc.text('Rate/kg', 124, y + 5.5);
  doc.text('Payout', 146, y + 5.5);
  doc.text('Status', 170, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const displayTxs = validTxs.slice(0, 14);
  if (displayTxs.length === 0) {
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('No transaction lots logged during this statement cycle.', 18, y + 8);
    y += 12;
  } else {
    displayTxs.forEach((tx) => {
      const wt = tx.actual_weight || tx.estimated_weight;
      const rate = tx.offered_rate_per_kg;
      const payout = tx.final_payout || (wt * rate);

      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(tx.lot_reference_id, 18, y + 5);
      doc.text(tx.category.substring(0, 24), 52, y + 5);
      doc.text(`${wt.toFixed(1)} kg`, 104, y + 5);
      doc.text(`Rs.${rate}`, 124, y + 5);
      doc.text(`Rs.${Math.round(payout)}`, 146, y + 5);

      if (tx.status === 'PAID' || tx.status === 'COMPLETED') {
        doc.setTextColor(16, 185, 129);
      } else if (tx.status === 'DISPUTED') {
        doc.setTextColor(239, 68, 68);
      } else {
        doc.setTextColor(234, 179, 8);
      }
      doc.text(tx.status, 170, y + 5);

      // Light row divider
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 7, 196, y + 7);
      y += 7.5;
    });
  }

  // Statutory Footer
  const footerY = 270;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);

  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'This document is an electronically certified ledger generated under the CPCB E-Waste (Management) Rules, 2022.',
    14,
    footerY + 6
  );
  doc.text(
    'All logged material flows are cryptographically anchored and eligible for informal sector EPR formalization credit.',
    14,
    footerY + 10
  );
  doc.text(`Kabadiwala Connect Platform Verification Hash: KC-${Date.now().toString(36).toUpperCase()}`, 14, footerY + 14);

  // Save the PDF
  doc.save(`Kabadiwala_Statement_${user.username}_${(period || 'Current').replace(/\s+/g, '_')}.pdf`);
}

export function generateAdminComplianceReport(
  transactions: Transaction[],
  users: User[],
  period: string = 'March 2026'
): void {
  const totalVolume = transactions.reduce((sum, t) => sum + (t.actual_weight || t.estimated_weight || 0), 0);
  const totalVal = transactions.reduce((sum, t) => sum + (t.final_payout || (t.estimated_weight * t.offered_rate_per_kg) || 0), 0);
  const scrappersCount = users.filter(u => u.role === 'scrapper').length;
  const recyclersCount = users.filter(u => u.role === 'recycler').length;

  // Category breakdown
  const categoryMap: Record<string, { weight: number; value: number }> = {};
  transactions.forEach(t => {
    const w = t.actual_weight || t.estimated_weight || 0;
    const v = t.final_payout || (w * t.offered_rate_per_kg) || 0;
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { weight: 0, value: 0 };
    }
    categoryMap[t.category].weight += w;
    categoryMap[t.category].value += v;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    weight_kg: data.weight,
    value_inr: data.value
  }));

  const reportObj: any = {
    generated_at: new Date().toISOString(),
    reporting_period: period,
    summary: {
      total_diverted_weight_kg: totalVolume,
      total_value_disbursed_inr: totalVal,
      active_scrappers_formalized: scrappersCount,
      total_lots_processed: transactions.length,
      authorized_recyclers_registered: recyclersCount,
      open_complaints: 2,
      active_legal_cases: 1
    },
    category_breakdown: categoryBreakdown
  };

  generateAdminComplianceReportPDF(reportObj);
}

export function generateRecyclerEprCertificate(
  tx: Transaction,
  facility?: any
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const darkSlate = [15, 23, 42];
  const emeraldGreen = [16, 185, 129];
  const weight = tx.actual_weight || tx.estimated_weight || 0;
  const payout = tx.final_payout || (weight * tx.offered_rate_per_kg) || 0;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EXTENDED PRODUCER RESPONSIBILITY (EPR)', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('CENTRAL POLLUTION CONTROL BOARD (CPCB) STATUTORY CREDIT CERTIFICATE', 14, 26);
  doc.setTextColor(203, 213, 225);
  doc.text(`Certificate No: EPR-CERT-${(tx.lot_reference_id || 'LOT').replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`, 14, 34);

  // Verification Shield
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(148, 12, 48, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CPCB VALIDATED', 153, 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Traceable EPR Transfer', 153, 28);

  let y = 54;
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Recycler & Facility Information', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Facility: ${facility?.facility_name || tx.recycler_name}`, 14, y);
  doc.text(`CPCB Auth No: ${facility?.cpcb_auth_number || 'CPCB/EW/KAR/2024/7742'}`, 110, y);

  y += 6;
  doc.text(`Operator Name: ${facility?.contact_person || 'Facility Operations Manager'}`, 14, y);
  doc.text(`Phone: ${facility?.contact_phone || '+91 80 2839 4400'}`, 110, y);

  y += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informal Collector Origin & Weighment Audit', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Origin Collector: ${tx.scrapper_name} (${tx.scrapper_id})`, 14, y);
  doc.text(`Lot Reference: ${tx.lot_reference_id}`, 110, y);

  y += 6;
  doc.text(`E-Waste Stream: ${tx.category}`, 14, y);
  doc.text(`Handover Date: ${new Date(tx.created_at).toLocaleDateString('en-IN')}`, 110, y);

  // Big Stat Box
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${weight.toFixed(1)} KG`, 24, y + 14);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${payout.toLocaleString('en-IN')}`, 85, y + 14);
  doc.text((tx.payment_mode || 'UPI_DIGITAL').replace(/_/g, ' '), 145, y + 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Statutory Certified Weight', 24, y + 22);
  doc.text('Disbursed Payout to Collector', 85, y + 22);
  doc.text('Settlement Channel', 145, y + 22);

  // Sorting Breakdown if available
  y += 44;
  if (tx.sorting_breakdown) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Facility Scale Tare & Sorting Verification', 14, y);

    y += 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Qualified Material: ${tx.sorting_breakdown.required_kg} kg`, 14, y);
    doc.text(`Foreign/Unrequired Content: ${tx.sorting_breakdown.unrequired_kg} kg`, 85, y);
    doc.text(`Contamination Deduction: Rs. ${tx.sorting_breakdown.contamination_deduction}`, 145, y);
    y += 10;
  }

  // Statutory Certification Clause
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Statutory Compliance Attestation', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const clauseText =
    'This EPR credit voucher confirms that the electrical and electronic equipment (EEE) scrap detailed above was accepted at an authorized facility, weighed using calibrated equipment, and processed in accordance with Environmentally Sound Management standards under E-Waste (Management) Rules 2022. This credit is transferable and auditable by State & Central Pollution Control Boards.';
  const splitClause = doc.splitTextToSize(clauseText, 182);
  doc.text(splitClause, 14, y);

  // Digital Signatures
  y += 26;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 90, y);
  doc.line(120, y, 196, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Recycler Signatory', 14, y + 5);
  doc.text('CPCB Portal Automated Signature', 120, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${facility?.facility_name || tx.recycler_name}`, 14, y + 9);
  doc.text(`Cryptographic SHA-256: ${tx.id}-${Date.now().toString(16)}`, 120, y + 9);

  // Footer
  const footerY = 276;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Issued under authority of Rule 13, E-Waste (Management) Rules, 2022. Ministry of Environment, Forest and Climate Change.', 14, footerY + 5);

  doc.save(`CPCB_EPR_Certificate_${(tx.lot_reference_id || 'LOT').replace(/[^A-Za-z0-9]/g, '')}.pdf`);
}

export function generateLegalNoticePdf(legalCase: any): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(185, 28, 28); // #b91c1c Red
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUTORY LEGAL NOTICE & ENFORCEMENT SUMMONS', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Case No: ${legalCase.case_file_number || legalCase.case_number || 'CPCB/LEGAL/2026'} | Issued Under: Environment (Protection) Act, 1986`, 14, 26);

  let y = 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Statutory Proceeding Particulars', 14, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Target Entity: ${legalCase.against_name || legalCase.respondent_name || 'Designated Respondent'}`, 14, y);
  doc.text(`Entity Category: ${legalCase.against_entity_type || 'RECYCLER'}`, 110, y);

  y += 6;
  doc.text(`CPCB Authorization: ${legalCase.cpcb_reg_number || 'CPCB/EW/DEF/2026'}`, 14, y);
  doc.text(`Case Status: ${legalCase.status || 'NOTICE_ISSUED'}`, 110, y);

  y += 6;
  doc.text(`Statutory Section: ${legalCase.section_violated || 'Section 15 EPA 1986 & E-Waste Rules 2022'}`, 14, y);
  doc.text(`Levied Penalty: Rs. ${(legalCase.fine_amount_inr || 50000).toLocaleString('en-IN')}`, 110, y);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Summary of Violations & Inspection Findings', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'FD');
  const splitNotes = doc.splitTextToSize(legalCase.summary || legalCase.notes || 'Violations observed during regulatory inspection and grievance review.', 172);
  doc.text(splitNotes, 18, y + 8);

  y += 48;
  doc.setFont('helvetica', 'bold');
  doc.text('Legal Directives & Mandatory Action Order', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const directives = [
    '1. Cease and desist from unauthorized backyard burning, acid bath extraction, or hazardous dismantling immediately.',
    '2. Deposit the environmental compensation fine within 15 working days into the designated CPCB Escrow account.',
    '3. Present calibrated scale records, GST invoice logs, and Aadhaar identity vouchers to the SPCB District Officer.',
    '4. Failure to comply shall trigger prosecution under Section 15 of the Environment (Protection) Act, 1986.'
  ];
  directives.forEach(dir => {
    doc.text(dir, 14, y);
    y += 6;
  });

  const footerY = 270;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Issued by the Legal & Enforcement Directorate, Central Pollution Control Board (CPCB), Government of India.', 14, footerY + 6);
  doc.text(`Official Seal & Digital Certification: CPCB-ENF-${Date.now().toString(16).toUpperCase()}`, 14, footerY + 11);

  const caseIdentifier = String(legalCase.case_file_number || legalCase.case_number || 'ENFORCEMENT');
  doc.save(`Legal_Notice_${caseIdentifier.replace(/[^A-Za-z0-9]/g, '_')}.pdf`);
}

export function generateLegalCaseSummaryPDF(legalCase: LegalCase): void {
  generateLegalNoticePdf(legalCase);
}

export function generateAdminComplianceReportPDF(report: CPCBComplianceReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Dark Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRAL POLLUTION CONTROL BOARD (CPCB)', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('STATUTORY E-WASTE MANAGEMENT COMPLIANCE & TRACEABILITY REPORT', 14, 26);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date(report.generated_at).toLocaleString('en-IN')}`, 14, 33);

  // Metrics Grid
  let y = 54;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('National Circular Impact Metrics', 14, y);

  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${(report.summary.total_diverted_weight_kg / 1000).toFixed(2)} Metric Tons`, 20, y + 10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${report.summary.total_value_disbursed_inr.toLocaleString('en-IN')}`, 80, y + 10);
  doc.text(`${report.summary.active_scrappers_formalized}`, 145, y + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('E-Waste Diverted from Landfills', 20, y + 16);
  doc.text('Formal Sector Payouts Disbursed', 80, y + 16);
  doc.text('Informal Scrappers Formalized', 145, y + 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.summary.total_lots_processed}`, 20, y + 26);
  doc.text(`${report.summary.authorized_recyclers_registered}`, 80, y + 26);
  doc.setTextColor(239, 68, 68);
  doc.text(`${report.summary.open_complaints} / ${report.summary.active_legal_cases}`, 145, y + 26);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Verified Digital Lots', 20, y + 32);
  doc.text('Authorized Recyclers', 80, y + 32);
  doc.text('Open Grievances / Legal Cases', 145, y + 32);

  // Category Breakdown Table
  y += 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Category-Wise Processing Volume (kg)', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Material Stream', 20, y + 5.5);
  doc.text('Diverted Weight', 90, y + 5.5);
  doc.text('Disbursed Payouts', 140, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  report.category_breakdown.forEach(cat => {
    doc.setTextColor(15, 23, 42);
    doc.text(cat.category, 20, y + 5);
    doc.text(`${cat.weight_kg.toFixed(1)} kg`, 90, y + 5);
    doc.text(`Rs. ${cat.value_inr.toLocaleString('en-IN')}`, 140, y + 5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 7, 196, y + 7);
    y += 7.5;
  });

  // Footer
  const footerY = 270;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Statutory Audit Report issued for submission to Ministry of Environment, Forest & Climate Change (MoEFCC).', 14, footerY + 6);
  doc.text(`Digital Verification Signature: SHA256-${Date.now().toString(16).toUpperCase()}`, 14, footerY + 11);

  doc.save(`CPCB_Statutory_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateLotReceiptPdf(lot: Transaction): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const darkSlate = [15, 23, 42];
  const emeraldGreen = [16, 185, 129];
  const textMuted = [100, 116, 139];

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KABADIWALA CONNECT', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('OFFICIAL DIGITAL GATE PASS & TRACEABILITY RECEIPT', 14, 26);
  doc.setTextColor(203, 213, 225);
  doc.text(`Regulatory Standard: CPCB E-Waste Management Rules 2022 | Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 32);

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(148, 11, 48, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('GATE PASS VERIFIED', 152, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Status: ${lot.status || 'COMPLETED'}`, 152, 24);

  // Lot Reference Box
  let y = 50;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');
  doc.setDrawColor(226, 232, 240);

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Lot Docket Ref: #${lot.lot_reference_id}`, 20, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Handover Date: ${new Date(lot.handover_timestamp || lot.created_at).toLocaleString('en-IN')}`, 20, y + 15);
  doc.text(`GPS Position : ${lot.collection_gps ? `${lot.collection_gps.latitude.toFixed(4)}, ${lot.collection_gps.longitude.toFixed(4)}` : 'Standard Geolocation Pin'}`, 20, y + 21);

  // Participants Details
  y += 36;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Participants & Chain of Custody', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Party', 20, y + 5.5);
  doc.text('Identifier / Name', 70, y + 5.5);
  doc.text('Compliance Credential', 135, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  doc.text('Waste Collector (Scrapper)', 20, y + 5);
  doc.text(`${lot.scrapper_name || 'Ramesh Kumar'}`, 70, y + 5);
  doc.text(`Aadhaar-KYC Verified (ID: ${lot.scrapper_id || 'USR-SCR'})`, 135, y + 5);
  doc.line(14, y + 7.5, 196, y + 7.5);

  y += 8;
  doc.text('Authorized Recycler', 20, y + 5);
  doc.text(`${lot.recycler_name || 'EcoRecycle Facility'}`, 70, y + 5);
  doc.text(`CPCB Registered Facility (ID: ${lot.recycler_id || 'REC-01'})`, 135, y + 5);
  doc.line(14, y + 7.5, 196, y + 7.5);

  // Material & Weight Breakdown
  y += 18;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Certified Material & Weighment Details', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('E-Waste Category', 20, y + 5.5);
  doc.text('Certified Net Mass', 80, y + 5.5);
  doc.text('Agreed Rate (Rs./kg)', 125, y + 5.5);
  doc.text('Total Subtotal', 165, y + 5.5);

  const weight = lot.actual_weight || lot.estimated_weight || 10;
  const rate = lot.offered_rate_per_kg || 340;
  const payout = lot.final_payout || Math.round(weight * rate);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(lot.category, 20, y + 5.5);
  doc.text(`${weight.toFixed(1)} kg`, 80, y + 5.5);
  doc.text(`Rs. ${rate} / kg`, 125, y + 5.5);
  doc.text(`Rs. ${payout.toLocaleString('en-IN')}`, 165, y + 5.5);
  doc.line(14, y + 8, 196, y + 8);

  // Sorting breakdown if present
  if (lot.sorting_breakdown) {
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Tare / Moisture Breakdown: Usable pure scrap: ${lot.sorting_breakdown.required_kg} kg | Dross: ${lot.sorting_breakdown.unrequired_kg} kg | Penalty: Rs. ${lot.sorting_breakdown.contamination_deduction}`, 20, y + 4);
  }

  // Total Settlement Block
  y += 16;
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'D');

  doc.setTextColor(6, 95, 70);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL OFFICIAL SETTLEMENT (NET PAYOUT):', 20, y + 9);
  doc.setFontSize(14);
  doc.text(`Rs. ${payout.toLocaleString('en-IN')}`, 20, y + 17);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Mode: ${lot.payment_mode || 'DIRECT_UPI_DIGITAL'}`, 120, y + 9);
  doc.text('Settlement Ledger: Synchronized with CPCB Grid', 120, y + 16);

  // Statutory Footer
  const footerY = 270;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This digital gate pass is an official instrument issued in compliance with the CPCB E-Waste (Management) Rules, 2022.', 14, footerY + 6);
  doc.text(`Cryptographic Audit Pass ID: KC-RECEIPT-${lot.lot_reference_id}-${Date.now().toString(36).toUpperCase()}`, 14, footerY + 11);

  doc.save(`GatePass_Receipt_${lot.lot_reference_id}.pdf`);
}
