import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useOpti } from "@/lib/opticore-context";
import { cn } from "@/lib/utils";

interface Msg { role: "ai" | "user"; text: string }

export function ChatWidget() {
  // Extraemos profile y simplex del contexto global
  const { profile, simplex } = useOpti();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola, soy el motor de OptiCore AI. ¿Qué escenario hipotético te gustaría evaluar para ${profile.name}?`,
      },
    ]);
  }, [profile.name]);

  // Hacemos que el scroll baje automáticamente también cuando la IA está escribiendo
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, isTyping]);

  const send = async () => {
    if (!input.trim() || isTyping) return;
    const user = input.trim();
    
    // 1. Mostrar mensaje del usuario inmediatamente
    setMessages((m) => [...m, { role: "user", text: user }]);
    setInput("");
    setIsTyping(true); // Activa el estado de carga

    try {
      // 2. Conectar con el Webhook de Make.com
      const response = await fetch("https://hook.us2.make.com/jd93ggdb1y16hbvjl5epqif3ndakbklq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          company_name: profile.name,
          datos_modelo: JSON.stringify(simplex), // Mandamos la matriz matemática actual
          mensaje_usuario: user // La pastilla que espera el Router
        })
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      // 3. Recibir y mostrar la respuesta de OpenAI
      const replyText = await response.text();
      setMessages((m) => [...m, { role: "ai", text: replyText }]);

    } catch (error) {
      console.error("Error en el chat:", error);
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Lo siento, tuve un problema de conexión con el motor estratégico. ¿Podemos intentarlo de nuevo?" }
      ]);
    } finally {
      setIsTyping(false); // Apaga el estado de carga
    }
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
          
          {/* Indicador de "Escribiendo..." */}
          {isTyping && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl px-3 py-2 text-sm max-w-[80%] bg-muted/50 text-foreground rounded-tl-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs opacity-70">Pensando...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ej. ¿Y si subo 10% el costo a La Paz?"
            className="h-9"
            disabled={isTyping} // Bloquea el input mientras responde
          />
          <Button size="icon" onClick={send} disabled={isTyping} className="h-9 w-9 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}