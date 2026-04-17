import { useEffect, useMemo, useState } from 'react';
import { Package, Upload, ArrowUpDown, History } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { api } from './services/api';
import { Card } from './components/Card';

const now = new Date();

export default function App() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({ productId: '', quantity: '', movementDate: new Date().toISOString().slice(0, 10), note: '', type: 'saida' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  async function loadData() {
    const [dashboardRes, stockRes, productsRes, movementRes] = await Promise.all([
      api.get(`/dashboard?month=${month}&year=${year}`),
      api.get(`/stock/current?month=${month}&year=${year}`),
      api.get('/products'),
      api.get(`/movements?month=${month}&year=${year}`),
    ]);
    setDashboard(dashboardRes.data);
    setStock(stockRes.data);
    setProducts(productsRes.data);
    setMovements(movementRes.data);
  }

  useEffect(() => { loadData().catch(() => setMessage('Erro ao carregar dados.')); }, [month, year]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage('');
    const data = new FormData();
    data.append('file', file);
    try {
      const response = await api.post('/imports/monthly', data);
      setMessage(`Importação concluída. ${response.data.importedProducts} produtos carregados.`);
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao importar arquivo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMovement(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/movements', {
        ...form,
        referenceMonth: month,
        referenceYear: year,
        quantity: Number(form.quantity),
      });
      setMessage('Movimentação registrada com sucesso.');
      setForm({ ...form, quantity: '', note: '' });
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao registrar movimentação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Sistema de Estoque do Setor</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Controle mensal com leitura automática do Excel</h1>
            <p className="mt-2 text-slate-300">Importe o estoque oficial do mês e registre apenas as saídas do dia.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
            <input className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            <button onClick={loadData} className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Atualizar</button>
          </div>
        </div>

        {message ? <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Card title="Produtos no mês" value={dashboard?.totals?.products ?? 0} subtitle="itens importados" />
          <Card title="Estoque base" value={dashboard?.totals?.baseQty ?? 0} subtitle="quantidade do mês" />
          <Card title="Saldo atual" value={dashboard?.totals?.currentQty ?? 0} subtitle="após entradas e saídas" />
          <Card title="Estoque baixo" value={dashboard?.totals?.lowStock ?? 0} subtitle="itens críticos" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-3"><History className="h-5 w-5 text-cyan-300" /><h2 className="text-xl font-bold">Saídas por dia</h2></div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard?.dailyOutputs || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Line type="monotone" dataKey="quantity" strokeWidth={3} stroke="#22d3ee" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-3"><Package className="h-5 w-5 text-cyan-300" /><h2 className="text-xl font-bold">Top saídas</h2></div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard?.topOutputs || []} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#cbd5e1" />
                  <YAxis dataKey="materialName" width={140} type="category" stroke="#cbd5e1" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="quantityOut" fill="#38bdf8" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleUpload} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-3"><Upload className="h-5 w-5 text-cyan-300" /><h2 className="text-xl font-bold">Importar estoque do mês</h2></div>
            <p className="mb-4 text-sm text-slate-300">Envie a planilha oficial. O sistema lê sozinho e grava como estoque base do mês.</p>
            <input className="mb-4 block w-full rounded-2xl border border-dashed border-white/20 bg-slate-900 px-4 py-5" type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button disabled={loading} className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">{loading ? 'Processando...' : 'Importar Excel'}</button>
          </form>

          <form onSubmit={handleMovement} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-3"><ArrowUpDown className="h-5 w-5 text-cyan-300" /><h2 className="text-xl font-bold">Registrar movimentação</h2></div>
            <div className="grid gap-3 md:grid-cols-2">
              <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
                <option value="">Selecione o produto</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.itemCode} - {product.materialName}</option>)}
              </select>
              <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="saida">Saída</option>
                <option value="entrada">Entrada</option>
                <option value="ajuste_negativo">Ajuste negativo</option>
                <option value="ajuste_positivo">Ajuste positivo</option>
              </select>
              <input className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" type="number" min="0.01" step="0.01" placeholder="Quantidade" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              <input className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" type="date" value={form.movementDate} onChange={(e) => setForm({ ...form, movementDate: e.target.value })} required />
              <textarea className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" rows="3" placeholder="Observação" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <button disabled={loading} className="mt-4 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">Salvar movimentação</button>
          </form>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-bold">Saldo atual por produto</h2>
          <div className="max-h-[420px] overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-900 text-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Produto</th>
                  <th className="px-4 py-3 text-left">Base</th>
                  <th className="px-4 py-3 text-left">Entradas</th>
                  <th className="px-4 py-3 text-left">Saídas</th>
                  <th className="px-4 py-3 text-left">Saldo</th>
                  <th className="px-4 py-3 text-left">Validade</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.productId} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">{item.itemCode}</td>
                    <td className="px-4 py-3">{item.materialName}</td>
                    <td className="px-4 py-3">{item.baseQty}</td>
                    <td className="px-4 py-3">{item.entries}</td>
                    <td className="px-4 py-3">{item.outputs}</td>
                    <td className={`px-4 py-3 font-semibold ${item.currentQty <= 10 ? 'text-rose-300' : 'text-emerald-300'}`}>{item.currentQty}</td>
                    <td className="px-4 py-3">{item.expiry || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-bold">Histórico de movimentações</h2>
          <div className="max-h-[360px] overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-900 text-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Produto</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Quantidade</th>
                  <th className="px-4 py-3 text-left">Observação</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">{new Date(movement.movementDate).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">{movement.product?.materialName}</td>
                    <td className="px-4 py-3 capitalize">{movement.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3">{movement.quantity}</td>
                    <td className="px-4 py-3">{movement.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
