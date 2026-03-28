import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Inbox } from "lucide-react";
import TicketCard from "../components/TicketCard";
import NewTicketModal from "../components/NewTicketModal";
import NotificationToast, { playNotificationSound } from "../components/NotificationToast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [notifications, setNotifications] = useState([]);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Supondo endpoint GET /tickets?requester_email=...&sort=-created_date&limit=100
      const data = await apiClient.get("/tickets", { requester_email: user.email, sort: "-created_date", limit: 100 });
      setTickets(data);
    } catch (err) {
      setTickets([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Para atualizações em tempo real, implemente polling ou WebSocket depois.

  const filtered = statusFilter === "todos" ? tickets : tickets.filter(t => t.status === statusFilter);

  const statusCounts = {
    aberto: tickets.filter(t => t.status === "aberto").length,
    em_atendimento: tickets.filter(t => t.status === "em_atendimento").length,
    resolvido: tickets.filter(t => ["resolvido", "fechado"].includes(t.status)).length,
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {user?.full_name?.split(" ")[0] || "Usuário"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Acompanhe seus chamados de suporte</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Abertos", value: statusCounts.aberto, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Em Atendimento", value: statusCounts.em_atendimento, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "Resolvidos", value: statusCounts.resolvido, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
            <SelectItem value="aguardando_usuario">Aguardando Usuário</SelectItem>
            <SelectItem value="resolvido">Resolvido</SelectItem>
            <SelectItem value="fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTickets}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="bg-brand hover:bg-brand/90" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Chamado
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted rounded-full p-6 mb-4">
            <Inbox className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Nenhum chamado encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Clique em "Novo Chamado" para abrir seu primeiro chamado</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <TicketCard ticket={ticket} />
            </motion.div>
          ))}
        </div>
      )}

      <NewTicketModal open={showModal} onClose={() => setShowModal(false)} user={user} onCreated={() => {}} />
      <NotificationToast notifications={notifications} onDismiss={id => setNotifications(n => n.filter(x => x.id !== id))} />
    </div>
  );
}