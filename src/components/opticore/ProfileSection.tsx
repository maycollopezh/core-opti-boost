import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOpti } from "@/lib/opticore-context";
import { Building2 } from "lucide-react";

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
              Define la identidad de tu empresa para personalizar el análisis estratégico.
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
      </CardContent>
    </Card>
  );
}