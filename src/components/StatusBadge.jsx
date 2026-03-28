export const STATUS_CONFIG = {
  aberto: { label: "Aberto", color: "bg-blue-100 text-blue-700 border-blue-200" },
  em_atendimento: { label: "Em Atendimento", color: "bg-amber-100 text-amber-700 border-amber-200" },
  aguardando_usuario: { label: "Aguardando Usuário", color: "bg-purple-100 text-purple-700 border-purple-200" },
  resolvido: { label: "Resolvido", color: "bg-green-100 text-green-700 border-green-200" },
  fechado: { label: "Fechado", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.aberto;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}