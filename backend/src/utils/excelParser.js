import XLSX from 'xlsx';

function safeNumber(value) {
  if (value === null || value === undefined || value === '' || value === '-') return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function excelDateToJS(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return null;
    return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseStockWorkbook(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });

  const headerIndex = rows.findIndex((row) => row.includes('Item') && row.includes('Material'));
  if (headerIndex === -1) {
    throw new Error('Não encontrei o cabeçalho da planilha.');
  }

  const metadata = {
    organization: null,
    warehouse: null,
    totalStockValue: 0,
    reportDate: null,
    sheetName,
  };

  rows.slice(0, headerIndex).forEach((row) => {
    row.forEach((cell, idx) => {
      if (cell === 'Órgão:') metadata.organization = row[idx + 9] || row[idx + 1] || metadata.organization;
      if (cell === 'Almoxarifado:') metadata.warehouse = row[idx + 3] || row[idx + 1] || metadata.warehouse;
      if (cell === 'VALOR TOTAL EM ESTOQUE:') metadata.totalStockValue = safeNumber(row[idx + 6] || row[idx + 1]);
      if (cell instanceof Date) metadata.reportDate = cell;
    });
  });

  const products = [];
  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const itemCode = row[1];
    const materialName = row[2];
    if (!itemCode || !materialName) continue;

    products.push({
      itemCode: String(itemCode).trim(),
      materialName: String(materialName).trim(),
      unitMeasure: row[13] ? String(row[13]).trim() : null,
      purchasePurpose: row[14] ? String(row[14]).trim() : null,
      directorate: row[16] ? String(row[16]).trim() : null,
      reservedQty: safeNumber(row[19]),
      reservedValue: safeNumber(row[20]),
      availableQty: safeNumber(row[22]),
      availableValue: safeNumber(row[23]),
      totalQty: safeNumber(row[26]),
      totalValue: safeNumber(row[28]),
      expiry: row[30] ? String(row[30]).trim() : null,
    });
  }

  const reportDate = metadata.reportDate || excelDateToJS(sheet['AA2']?.v);
  const month = reportDate ? reportDate.getMonth() + 1 : 1;
  const year = reportDate ? reportDate.getFullYear() : new Date().getFullYear();

  return {
    metadata: { ...metadata, referenceMonth: month, referenceYear: year },
    products,
  };
}
