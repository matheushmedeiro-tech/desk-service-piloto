import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import UrgencyBadge from "./UrgencyBadge";

// Web Audio API sound generator
export function playNotificationSound(urgency = "media") {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  const configs = {
    baixa: [{ freq: 440, dur: 0.15, vol: 0.2 }],
    media: [{ freq: 523, dur: 0.15, vol: 0.3 }, { freq: 659, dur: 0.2, vol: 0.3 }],
    alta: [{ freq: 880, dur: 0.12, vol: 0.4 }, { freq: 1046, dur: 0.12, vol: 0.4 }, { freq: 880, dur: 0.15, vol: 0.4 }],
    critica: [{ freq: 1046, dur: 0.1, vol: 0.5 }, { freq: 1318, dur: 0.1, vol: 0.5 }, { freq: 1046, dur: 0.1, vol: 0.5 }, { freq: 1318, dur: 0.15, vol: 0.5 }],
  };

  const notes = configs[urgency] || configs.media;
  let time = ctx.currentTime;
  notes.forEach(({ freq, dur, vol }) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = urgency === "critica" ? "square" : "sine";
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.start(time);
    osc.stop(time + dur);
    time += dur + 0.05;
  });
}

export default function NotificationToast({ notifications, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-card border border-border rounded-xl shadow-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="bg-brand/10 rounded-lg p-2 mt-0.5 flex-shrink-0">
                <Bell className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{n.title}</span>
                  {n.urgency && <UrgencyBadge urgency={n.urgency} />}
                </div>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </div>
              <button onClick={() => onDismiss(n.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}