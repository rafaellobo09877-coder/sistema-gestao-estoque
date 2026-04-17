import xlsx from 'xlsx';
import prisma from '../prisma/client.js';

export async function importMonthly(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // 🔥 pula o cabeçalho da sua planilha
    data = data.slice(13);

    // 🔥 CRIA O IMPORT DO MÊS (ESSENCIAL)
    const stockImport = await prisma.stockImport.create({
      data: {
        referenceMonth: new Date().getMonth() + 1,
        referenceYear: new Date().getFullYear(),
        fileName: req.file.originalname,
      }
    });

    let count = 0;

    for (const row of data) {
      const itemCode = row[1];
      const material = row[2];
      const quantidade = row[22];

      if (!itemCode || !material) continue;

      const qty = Number(quantidade) || 0;

      // 🔥 cria ou atualiza produto
      const product = await prisma.product.upsert({
        where: { itemCode: String(itemCode) },
        update: {},
        create: {
          itemCode: String(itemCode),
          materialName: String(material),
        },
      });

      // 🔥 salva no estoque mensal (CORRETO PRO SEU BANCO)
      await prisma.monthlyStock.create({
        data: {
          importId: stockImport.id,   // 🔥 obrigatório
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
    console.error(err);
    return res.status(400).json({ error: 'Erro ao processar planilha' });
  }
}