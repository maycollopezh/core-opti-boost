import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOpti } from "@/lib/opticore-context";
import { Building2, Package, Clock, Target } from "lucide-react";

export function ProfileSection() {
  const { profile, setProfile } = useOpti();
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              Configuración del Perfil de Empresa
            </CardTitle>
            <CardDescription className="mt-1">
              Define la identidad y los recursos limitantes para el modelo de optimización.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nombre de la Empresa</Label>
            <Input
              placeholder="DataCom Bolivia"
              value={profile.name}
              onChange={(e) => setProfile({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Rubro</Label>
            <Input
              placeholder="Servicios IT"
              value={profile.industry}
              onChange={(e) => setProfile({ industry: e.target.value })}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Recursos limitantes (variables del modelo)
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ResourceInput
              icon={<Package className="h-4 w-4 text-primary" />}
              label="Recurso 1"
              value={profile.resource1Name}
              onChange={(v) => setProfile({ resource1Name: v })}
            />
            <ResourceInput
              icon={<Clock className="h-4 w-4 text-accent" />}
              label="Recurso 2"
              value={profile.resource2Name}
              onChange={(v) => setProfile({ resource2Name: v })}
            />
            <ResourceInput
              icon={<Target className="h-4 w-4 text-chart-3" />}
              label="Demanda"
              value={profile.demandName}
              onChange={(v) => setProfile({ demandName: v })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceInput({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}