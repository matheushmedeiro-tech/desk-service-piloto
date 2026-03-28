import { Link } from "react-router-dom";
import { Clock, MessageSquare, User } from "lucide-react";
import StatusBadge from "./StatusBadge";
import UrgencyBadge from "./UrgencyBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TicketCard({ ticket, showAssignee = false }) {
  const timeAgo = ticket.created_date
    ? formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true, locale: ptBR })
    : "";

  return (
    <Link to={`/ticket/${ticket.id}`}>
      <div className="bg-card border border-border rounded-xl p-4 hover:border-brand/40 hover:shadow-md transition-all duration-200 group cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">#{ticket.ticket_number || ticket.id?.slice(-6)}</span>
              <UrgencyBadge urgency={ticket.urgency} />
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors truncate">{ticket.title}</h3>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ticket.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {ticket.requester_name}
          </span>
          {showAssignee && ticket.assigned_to && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {ticket.assigned_to}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>
      </div>
    </Link>
  );
}