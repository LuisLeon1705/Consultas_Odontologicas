import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DbStatus } from "@/components/db-status"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-sans">Sistema de Gestión Odontológica</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <DbStatus />

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>Detalles sobre el sistema de gestión odontológica</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Este sistema permite gestionar pacientes, consultas odontológicas y odontólogos.</p>
            <p className="mb-4">Utiliza Next.js para el frontend y backend, y MySQL para la base de datos.</p>
            <p>Si la base de datos no está disponible, el sistema funcionará con datos en memoria.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
