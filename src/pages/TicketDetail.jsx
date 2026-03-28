import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Paperclip, User, Clock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isIT = user?.role === "admin" || user?.role === "it";
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState("messages");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        // Supondo endpoints REST:
        // GET /tickets/:id, GET /ticket-messages?ticket_id=, GET /ticket-logs?ticket_id=
        const [ticket, msgs, lgz] = await Promise.all([
          apiClient.get(`/tickets/${id}`),
          apiClient.get('/ticket-messages', { ticket_id: id, sort: 'created_date', limit: 200 }),
          apiClient.get('/ticket-logs', { ticket_id: id, sort: 'created_date', limit: 200 }),
        ]);
        setTicket(ticket);
        setMessages(msgs);
        setLogs(lgz);
      } catch (err) {
        setTicket(null);
        setMessages([]);
        setLogs([]);
      }
    };
    loadAll();
  }, [id]);

  // Para atualizações em tempo real, implemente polling ou WebSocket depois.

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    const attachments = [];
    for (const file of files) {
      // Supondo endpoint POST /upload para arquivos (ajuste conforme seu backend)
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const { file_url } = await response.json();
      attachments.push(file_url);
    }
    await apiClient.post('/ticket-messages', {
      ticket_id: id,
      content: newMessage,
      author_name: user.full_name || user.email,
      author_role: isIT ? (user.role === "admin" ? "admin" : "it") : "user",
      attachment_urls: attachments,
    });
    setNewMessage("");
    setFiles([]);
    setSendingMsg(false);
  };

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    const updates = { status: newStatus };
    if (newStatus === "em_atendimento" && !ticket.assigned_to) {
      updates.assigned_to = user.full_name || user.email;
      updates.assigned_to_email = user.email;
    }
    if (newStatus === "resolvido") updates.resolved_at = new Date().toISOString();
    if (newStatus === "fechado") updates.closed_at = new Date().toISOString();

    await apiClient.put(`/tickets/${id}`, updates);
    await apiClient.post('/ticket-logs', {
      ticket_id: id,
      action: `Status alterado para: ${newStatus}`,
      actor_name: user.full_name || user.email,
      actor_email: user.email,
      details: `Status atualizado de ${ticket.status} para ${newStatus}`,
    });
    setUpdatingStatus(false);
  };

  if (!ticket) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-mono text-muted-foreground">#{ticket.ticket_number || id.slice(-6)}</span>
              <UrgencyBadge urgency={ticket.urgency} />
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-xl font-bold text-foreground">{ticket.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{ticket.description}</p>
          </div>
          {isIT && (
            <div className="flex flex-col gap-2 min-w-40">
              <Select value={ticket.status} onValueChange={updateStatus} disabled={updatingStatus}>
                <SelectTrigger className="w-full">
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue />}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                  <SelectItem value="aguardando_usuario">Aguardando Usuário</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Solicitante</div>
            <div className="font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {ticket.requester_name}
            </div>
          </div>
          {ticket.requester_department && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Setor</div>
              <div className="font-medium">{ticket.requester_department}</div>
            </div>
          )}
          {ticket.assigned_to && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Atribuído a</div>
              <div className="font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                {ticket.assigned_to}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Aberto</div>
            <div className="font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true, locale: ptBR })}
            </div>
          </div>
        </div>

        {ticket.attachment_urls?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Anexos do chamado</div>
            <div className="flex flex-wrap gap-2">
              {ticket.attachment_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  className="text-xs bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80 transition-colors flex items-center gap-1.5">
                  <Paperclip className="w-3 h-3" />
                  Anexo {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted p-1 rounded-xl w-fit">
        {["messages", "logs"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "messages" ? `💬 Mensagens (${messages.length})` : `📋 Histórico (${logs.length})`}
          </button>
        ))}
      </div>

      {/* Messages */}
      {tab === "messages" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda. Inicie a conversa!</p>
              )}
              {messages.map((msg) => {
                const isOwn = msg.created_by === user?.email;
                const isITMsg = msg.author_role === "it" || msg.author_role === "admin";
                return (
                  <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                      ${isITMsg ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"}`}>
                      {msg.author_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={`max-w-xs md:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <span className="font-medium">{msg.author_name}</span>
                        {isITMsg && <span className="text-brand text-xs">• TI</span>}
                        <span>{formatDistanceToNow(new Date(msg.created_date), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isOwn ? "bg-brand text-white rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {msg.content}
                      </div>
                      {msg.attachment_urls?.length > 0 && (
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {msg.attachment_urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer"
                              className="text-xs text-brand underline flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              Anexo
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {!["fechado"].includes(ticket.status) && (
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    rows={2}
                    className="resize-none flex-1"
                  />
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <input type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files))} />
                    </label>
                    <Button onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()} size="icon" className="bg-brand hover:bg-brand/90">
                      {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {files.map((f, i) => (
                      <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{f.name}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Logs */}
      {tab === "logs" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            {logs.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">Nenhum log registrado ainda.</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-brand mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{log.action}</div>
                  {log.details && <div className="text-xs text-muted-foreground mt-0.5">{log.details}</div>}
                  <div className="text-xs text-muted-foreground mt-1">
                    {log.actor_name} • {log.created_date && format(new Date(log.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}