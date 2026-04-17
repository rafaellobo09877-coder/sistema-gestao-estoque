import dayjs from 'dayjs';
import { prisma } from '../lib.js';
import { parseStockWorkbook } from '../utils/excelParser.js';

export async function importMonthlyStock(filePath, fileName) {
  const { metadata, products } = parseStockWorkbook(filePath);

  const existing = await prisma.stockImport.findFirst({
    where: {
      referenceMonth: metadata.referenceMonth,
      referenceYear: metadata.referenceYear,
      warehouse: metadata.warehouse || null,
    },
  });

  if (existing) {
    throw new Error(`Já existe importação para ${String(metadata.referenceMonth).padStart(2, '0')}/${metadata.referenceYear} no almoxarifado ${metadata.warehouse || 'não informado'}.`);
  }

  return prisma.$transaction(async (tx) => {
    const stockImport = await tx.stockImport.create({
      data: {
        referenceMonth: metadata.referenceMonth,
        referenceYear: metadata.referenceYear,
        fileName,
        warehouse: metadata.warehouse || null,
        organization: metadata.organization || null,
        reportDate: metadata.reportDate || null,
        totalStockValue: metadata.totalStockValue || 0,
        status: 'confirmed',
      },
    });

    for (const item of products) {
      const product = await tx.product.upsert({
        where: { itemCode: item.itemCode },
        update: {
          materialName: item.materialName,
          unitMeasure: item.unitMeasure,
          purchasePurpose: item.purchasePurpose,
          directorate: item.directorate,
          active: true,
        },
        create: {
          itemCode: item.itemCode,
          materialName: item.materialName,
          unitMeasure: item.unitMeasure,
          purchasePurpose: item.purchasePurpose,
          directorate: item.directorate,
        },
      });

      await tx.monthlyStock.create({
        data: {
          importId: stockImport.id,
          productId: product.id,
          reservedQty: item.reservedQty,
          reservedValue: item.reservedValue,
          availableQty: item.availableQty,
          availableValue: item.availableValue,
          totalQty: item.totalQty,
          totalValue: item.totalValue,
          unitEstimatedValue: item.totalQty > 0 ? item.totalValue / item.totalQty : 0,
          expiry: item.expiry,
        },
      });

      await tx.stockAlert.upsert({
        where: { productId: product.id },
        update: {},
        create: { productId: product.id, minimumQty: Math.max(5, Math.ceil(item.totalQty * 0.1)) },
      }).catch(() => {});
    }

    return {
      stockImport,
      importedProducts: products.length,
    };
  });
}

export async function getDashboard(referenceMonth, referenceYear) {
  const importRecord = await prisma.stockImport.findFirst({
    where: { referenceMonth, referenceYear },
    orderBy: { importedAt: 'desc' },
  });

  if (!importRecord) {
    return {
      totals: { products: 0, baseQty: 0, currentQty: 0, lowStock: 0 },
      lowStockItems: [],
      topOutputs: [],
      dailyOutputs: [],
    };
  }

  const monthlyStocks = await prisma.monthlyStock.findMany({
    where: { importId: importRecord.id },
    include: { product: true },
  });

  const movements = await prisma.movement.findMany({
    where: { referenceMonth, referenceYear },
    include: { product: true },
    orderBy: { movementDate: 'asc' },
  });

  const movementMap = new Map();
  const dailyMap = new Map();

  for (const movement of movements) {
    const current = movementMap.get(movement.productId) || { in: 0, out: 0 };
    if (movement.type === 'entrada' || movement.type === 'ajuste_positivo') current.in += movement.quantity;
    else current.out += movement.quantity;
    movementMap.set(movement.productId, current);

    if (movement.type === 'saida') {
      const dayKey = dayjs(movement.movementDate).format('DD/MM');
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + movement.quantity);
    }
  }

  const lowStockItems = [];
  const topOutputs = [];
  let baseQty = 0;
  let currentQty = 0;

  for (const row of monthlyStocks) {
    baseQty += row.totalQty;
    const totals = movementMap.get(row.productId) || { in: 0, out: 0 };
    const saldo = row.totalQty + totals.in - totals.out;
    currentQty += saldo;

    const alert = await prisma.stockAlert.findFirst({ where: { productId: row.productId, active: true } });
    if (alert && saldo <= alert.minimumQty) {
      lowStockItems.push({
        productId: row.productId,
        itemCode: row.product.itemCode,
        materialName: row.product.materialName,
        saldoAtual: saldo,
        estoqueMinimo: alert.minimumQty,
      });
    }

    if (totals.out > 0) {
      topOutputs.push({
        productId: row.productId,
        materialName: row.product.materialName,
        quantityOut: totals.out,
        saldoAtual: saldo,
      });
    }
  }

  topOutputs.sort((a, b) => b.quantityOut - a.quantityOut);

  return {
    referenceMonth,
    referenceYear,
    totals: {
      products: monthlyStocks.length,
      baseQty,
      currentQty,
      lowStock: lowStockItems.length,
    },
    lowStockItems: lowStockItems.slice(0, 10),
    topOutputs: topOutputs.slice(0, 10),
    dailyOutputs: [...dailyMap.entries()].map(([date, quantity]) => ({ date, quantity })),
  };
}

export async function listCurrentStock(referenceMonth, referenceYear) {
  const importRecord = await prisma.stockImport.findFirst({
    where: { referenceMonth, referenceYear },
    orderBy: { importedAt: 'desc' },
  });
  if (!importRecord) return [];

  const monthlyStocks = await prisma.monthlyStock.findMany({
    where: { importId: importRecord.id },
    include: { product: true },
    orderBy: { product: { materialName: 'asc' } },
  });

  const movements = await prisma.movement.findMany({ where: { referenceMonth, referenceYear } });
  const map = new Map();
  for (const movement of movements) {
    const current = map.get(movement.productId) || { in: 0, out: 0 };
    if (movement.type === 'entrada' || movement.type === 'ajuste_positivo') current.in += movement.quantity;
    else current.out += movement.quantity;
    map.set(movement.productId, current);
  }

  return monthlyStocks.map((row) => {
    const totals = map.get(row.productId) || { in: 0, out: 0 };
    return {
      productId: row.productId,
      itemCode: row.product.itemCode,
      materialName: row.product.materialName,
      unitMeasure: row.product.unitMeasure,
      directorate: row.product.directorate,
      baseQty: row.totalQty,
      entries: totals.in,
      outputs: totals.out,
      currentQty: row.totalQty + totals.in - totals.out,
      expiry: row.expiry,
    };
  });
}
