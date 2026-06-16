import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { useOpti } from "@/lib/opticore-context";
import { cn } from "@/lib/utils";

interface Msg { role: "ai" | "user"; text: string }

export function ChatWidget() {
  const { profile } = useOpti();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola, soy el motor de OptiCore AI. ¿Qué escenario hipotético te gustaría evaluar para ${profile.name}?`,
      },
    ]);
  }, [profile.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    const user = input.trim();
    setMessages((m) => [...m, { role: "user", text: user }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: `Analizando sensibilidad para "${user}"... Si incrementas ese parámetro en 10%, la función objetivo Z subiría aproximadamente Bs. 150 manteniendo la región factible estable. Recomiendo validar el precio sombra del recurso involucrado.`,
        },
      ]);
    }, 700);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/40 transition-transform hover:scale-105"
        aria-label="Abrir asistente What-If"
      >
        {open ? <X className="h-6 w-6 text-primary-foreground" /> : <MessageSquare className="h-6 w-6 text-primary-foreground" />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] origin-bottom-right rounded-2xl border border-border/60 bg-card shadow-2xl transition-all duration-200",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">Asistente What-If</div>
            <div className="text-[11px] text-muted-foreground">Análisis de sensibilidad en vivo</div>
          </div>
        </div>

        <div ref={scrollRef} className="h-[360px] overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  m.role === "ai" ? "bg-primary/15 text-primary" : "bg-accent/20 text-accent",
                )}
              >
                {m.role === "ai" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm max-w-[80%]",
                  m.role === "ai"
                    ? "bg-muted/50 text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ej. ¿Y si subo 10% el costo a La Paz?"
            className="h-9"
          />
          <Button size="icon" onClick={send} className="h-9 w-9 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}