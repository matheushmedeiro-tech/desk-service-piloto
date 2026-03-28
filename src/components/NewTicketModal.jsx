import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/api/apiClient";
import { Loader2, Paperclip, X } from "lucide-react";

export default function NewTicketModal({ open, onClose, user, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", urgency: "media", department: "" });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    // Supondo endpoint POST /upload para arquivos (ajuste conforme seu backend)
    const attachments = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const { file_url } = await response.json();
      attachments.push(file_url);
    }

    const ticketNumber = `GRP-${Date.now().toString().slice(-6)}`;
    const ticket = await apiClient.post('/tickets', {
      ticket_number: ticketNumber,
      title: form.title,
      description: form.description,
      urgency: form.urgency,
      requester_name: user.full_name || user.email,
      requester_email: user.email,
      requester_department: form.department,
      status: "aberto",
      attachment_urls: attachments,
    });

    await apiClient.post('/ticket-logs', {
      ticket_id: ticket.id,
      action: "Chamado aberto",
      actor_name: user.full_name || user.email,
      actor_email: user.email,
      details: `Chamado ${ticketNumber} aberto por ${user.full_name || user.email}`,
    });

    setLoading(false);
    setForm({ title: "", description: "", urgency: "media", department: "" });
    setFiles([]);
    onCreated?.(ticket);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Abrir Novo Chamado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Título *</Label>
            <Input
              placeholder="Descreva brevemente o problema..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label>Descrição detalhada *</Label>
            <Textarea
              placeholder="Descreva o problema com detalhes, incluindo o que aconteceu e quando..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required
              rows={4}
              className="mt-1 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Urgência *</Label>
              <Select value={form.urgency} onValueChange={v => setForm(p => ({ ...p, urgency: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  <SelectItem value="media">🔵 Média</SelectItem>
                  <SelectItem value="alta">🟠 Alta</SelectItem>
                  <SelectItem value="critica">🔴 Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor</Label>
              <Input
                placeholder="Ex: Financeiro, RH..."
                value={form.department}
                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Anexos (opcional)</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-lg p-3 text-center hover:border-brand/40 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-1">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Clique para anexar arquivos</span>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {files.map((f, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                      {f.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFiles(files.filter((_, j) => j !== i))} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand hover:bg-brand/90" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Enviando..." : "Abrir Chamado"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}