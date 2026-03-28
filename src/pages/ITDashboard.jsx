import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Filter, Inbox } from "lucide-react";
import TicketCard from "../components/TicketCard";
import StatsPanel from "../components/StatsPanel";
import NotificationToast, { playNotificationSound } from "../components/NotificationToast";
import { motion, AnimatePresence } from "framer-motion";

export default function ITDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [urgencyFilter, setUrgencyFilter] = useState("todos");
  const [notifications, setNotifications] = useState([]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Supondo endpoint GET /tickets?sort=-created_date&limit=200
      const data = await apiClient.get("/tickets", { sort: "-created_date", limit: 200 });
      setTickets(data);
    } catch (err) {
      setTickets([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Para atualizações em tempo real, implemente polling ou WebSocket depois.

  const filtered = tickets.filter(t => {
    if (statusFilter !== "todos" && t.status !== statusFilter) return false;
    if (urgencyFilter !== "todos" && t.urgency !== urgencyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.requester_name?.toLowerCase().includes(q) ||
        t.ticket_number?.toLowerCase().includes(q) ||
        t.requester_department?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Painel de TI</h1>
        <p className="text-muted-foreground mt-1">Gerenciamento de chamados em tempo real</p>
      </div>

      <StatsPanel tickets={tickets} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, usuário, setor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
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
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Urgência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="baixa">🟢 Baixa</SelectItem>
            <SelectItem value="media">🔵 Média</SelectItem>
            <SelectItem value="alta">🟠 Alta</SelectItem>
            <SelectItem value="critica">🔴 Crítica</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-3">
        {filtered.length} chamado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted rounded-full p-6 mb-4">
            <Inbox className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Nenhum chamado encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {filtered.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <TicketCard ticket={ticket} showAssignee />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <NotificationToast notifications={notifications} onDismiss={id => setNotifications(n => n.filter(x => x.id !== id))} />
    </div>
  );
}