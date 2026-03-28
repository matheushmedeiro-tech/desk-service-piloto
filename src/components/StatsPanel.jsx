import { CheckCircle2, Clock, AlertTriangle, TicketIcon } from "lucide-react";

export default function StatsPanel({ tickets }) {
  const total = tickets.length;
  const abertos = tickets.filter(t => t.status === "aberto").length;
  const emAtendimento = tickets.filter(t => t.status === "em_atendimento").length;
  const criticos = tickets.filter(t => t.urgency === "critica" && !["resolvido", "fechado"].includes(t.status)).length;
  const resolvidos = tickets.filter(t => t.status === "resolvido" || t.status === "fechado").length;

  const avgTime = (() => {
    const resolved = tickets.filter(t => t.resolved_at && t.created_date);
    if (!resolved.length) return "—";
    const avg = resolved.reduce((acc, t) => {
      return acc + (new Date(t.resolved_at) - new Date(t.created_date));
    }, 0) / resolved.length;
    const hours = Math.floor(avg / 3600000);
    return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  })();

  const stats = [
    { label: "Total", value: total, icon: TicketIcon, color: "text-brand", bg: "bg-brand/10" },
    { label: "Abertos", value: abertos, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Em Atendimento", value: emAtendimento, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Críticos", value: criticos, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Resolvidos", value: resolvidos, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Tempo Médio", value: avgTime, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center">
          <div className={`${s.bg} rounded-lg p-2 mb-2`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}