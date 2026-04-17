export function Card({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
      <p className="text-sm text-slate-300">{title}</p>
      <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
      {subtitle ? <p className="mt-2 text-xs text-slate-400">{subtitle}</p> : null}
    </div>
  );
}
