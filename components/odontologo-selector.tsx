"use client";

import type React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface Odontologo {
  id: number;
  nombre: string;
  apellido: string;
}

interface OdontologoSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function OdontologoSelector({
  value,
  onChange,
}: OdontologoSelectorProps) {
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [usingMemory, setUsingMemory] = useState(false);

  // Formulario para nuevo odontólogo
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tipoCedula, setTipoCedula] = useState("V");
  const [cedula, setCedula] = useState("");
  const [cargo, setEspecialidad] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaContratacion, setFechaContratacion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Verificar el estado de la base de datos
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db-status");
        const data = await response.json();
        setUsingMemory(data.usingMemory);

        if (data.usingMemory) {
          console.warn("Usando datos en memoria en lugar de base de datos");
        }
      } catch (error) {
        console.error(
          "Error al verificar el estado de la base de datos:",
          error
        );
        setUsingMemory(true);
      }
    };

    checkDbStatus();
  }, []);

  useEffect(() => {
    const fetchOdontologos = async () => {
      try {
        const response = await fetch("/api/odontologos");
        if (!response.ok) {
          throw new Error("No se pudieron cargar los odontólogos");
        }
        const data = await response.json();
        setOdontologos(data);
      } catch (error) {
        console.error("Error al cargar odontólogos:", error);
        setError("Error al cargar odontólogos. Por favor, inténtelo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchOdontologos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !nombre ||
      !apellido ||
      !cedula ||
      !email ||
      !telefono ||
      !fechaNacimiento ||
      !fechaContratacion ||
      !direccion
    ) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/odontologos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          cedula: `${tipoCedula}${cedula}`,
          cargo: cargo || "General",
          email,
          telefono,
          fecha_nacimiento: fechaNacimiento,
          fecha_contratacion: fechaContratacion,
          direccion,
          cargo: "Odontólogo",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el odontólogo");
      }

      const nuevoOdontologo = await response.json();

      // Actualizar la lista de odontólogos
      setOdontologos([...odontologos, nuevoOdontologo]);

      // Seleccionar el nuevo odontólogo
      onChange(nuevoOdontologo.id);

      // Limpiar el formulario
      resetForm();

      // Cerrar el diálogo
      setOpen(false);
    } catch (error) {
      console.error("Error al registrar odontólogo:", error);
      alert("Error al registrar odontólogo. Por favor, inténtelo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setTipoCedula("V");
    setCedula("");
    setEspecialidad("");
    setEmail("");
    setTelefono("");
    setFechaNacimiento("");
    setFechaContratacion("");
    setDireccion("");
  };

  if (loading) {
    return <div>Cargando odontólogos...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {usingMemory && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo de datos en memoria</AlertTitle>
          <AlertDescription>
            El sistema está funcionando con datos en memoria debido a problemas
            de conexión con la base de datos. Los cambios no serán persistentes.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Select
          value={value?.toString()}
          onValueChange={(value) => onChange(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar odontólogo" />
          </SelectTrigger>
          <SelectContent>
            {odontologos.map((odontologo) => (
              <SelectItem key={odontologo.id} value={odontologo.id.toString()}>
                {odontologo.nombre} {odontologo.apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Odontólogo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  <div className="flex">
                    <Select value={tipoCedula} onValueChange={setTipoCedula}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="V">V</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="cedula"
                      className="flex-1 ml-2"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">cargo</Label>
                  <Input
                    id="cargo"
                    value={cargo}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    placeholder="General"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_contratacion">
                    Fecha de Contratación
                  </Label>
                  <Input
                    id="fecha_contratacion"
                    type="date"
                    value={fechaContratacion}
                    onChange={(e) => setFechaContratacion(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar Odontólogo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
