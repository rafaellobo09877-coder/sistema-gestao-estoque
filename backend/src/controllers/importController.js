import xlsx from 'xlsx';
import prisma from '../prisma/client.js';

export async function importMonthly(req, res) {
  try {
    // valida arquivo
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    // lê Excel
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // pula cabeçalho (ajuste se precisar)
    data = data.slice(13);

    // cria registro do mês
    const stockImport = await prisma.stockImport.create({
      data: {
        referenceMonth: new Date().getMonth() + 1,
        referenceYear: new Date().getFullYear(),
        fileName: req.file.originalname,
      }
    });

    let count = 0;

    for (const row of data) {
      const itemCode = String(row[1] || '').trim();
      const material = String(row[2] || '').trim();
      const quantidade = row[22];

      // ignora linha vazia
      if (!itemCode || !material) continue;

      // 🔥 CORREÇÃO DO EXCEL (IMPORTANTE)
      const qty = parseFloat(
        String(quantidade || '0').replace(',', '.')
      ) || 0;

      // cria ou atualiza produto
      const product = await prisma.product.upsert({
        where: { itemCode },
        update: {},
        create: {
          itemCode,
          materialName: material,
        },
      });

      // salva estoque
      await prisma.monthlyStock.create({
        data: {
          importId: stockImport.id,
          productId: product.id,
          availableQty: qty,
          totalQty: qty,
        },
      });

      count++;
    }

    return res.json({
      message: 'Importação concluída com sucesso',
      importedProducts: count,
    });

  } catch (err) {
    console.log('🔥 ERRO REAL:', err);
    return res.status(500).json({ error: 'Erro ao processar planilha' });
  }
}