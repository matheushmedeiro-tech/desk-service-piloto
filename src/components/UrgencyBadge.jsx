export const URGENCY_CONFIG = {
  baixa: { label: "Baixa", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  media: { label: "Média", color: "bg-sky-100 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  critica: { label: "Crítica", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
};

export default function UrgencyBadge({ urgency }) {
  const cfg = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.media;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}