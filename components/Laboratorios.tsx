"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface LaboratoriosProps {
  mode: "view" | "edit" | "new";
  onChange?: (data: SolicitudLaboratorio[]) => void;
  readOnly?: boolean;
  initialData?: SolicitudLaboratorio[];
  consultaId?: number;
  tipoConsulta?: "medica" | "odontologica";
}

export default function Laboratorios({
  mode,
  onChange,
  readOnly = false,
  initialData,
  consultaId,
  tipoConsulta,
}: LaboratoriosProps) {
  const [solicitudes, setSolicitudes] = useState<SolicitudLaboratorio[]>(
    initialData || []
  );
  const [tipoPruebas, setTipoPruebas] = useState<TipoPrueba[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const getIsExamenesInInitialData = (
    solicitudId: number,
    tipoPruebaId: number
  ) => {
    return initialData?.some((sol) => {
      if (sol.solicitud_id === solicitudId) {
        return sol.examenes.some(
          (examen: any) => examen.tipo_prueba_id === tipoPruebaId
        );
      }
      return false;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTipos = await fetch("/api/tipo_prueba");
        if (resTipos.ok) setTipoPruebas(await resTipos.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    if (onChange) {
      onChange(solicitudes);
    }
  }, [solicitudes, onChange]);

  const agregarSolicitud = () => {
    const nuevaSolicitud: SolicitudLaboratorio = {
      solicitud_id: Date.now(),
      paciente_id: 0,
      medico_id: 0,
      motivo: "",
      estado: "Pendiente",
      fecha: new Date().toISOString(),
      observacion: "",
      consulta_id: consultaId || 0,
      tipo_consulta: tipoConsulta || "medica",
      examenes: [],
    };

    setSolicitudes((prev) => [...prev, nuevaSolicitud]);
  };

  const handleExamChange = (solicitudId: number, tipoPruebaId: number) => {
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.solicitud_id === solicitudId
          ? {
              ...s,
              examenes: s.examenes.some(
                (e) => e.tipo_prueba_id === tipoPruebaId
              )
                ? s.examenes
                : [
                    ...s.examenes,
                    {
                      tipo_prueba_id: tipoPruebaId,
                      nombre:
                        tipoPruebas.find((tp) => tp.tipo_id === tipoPruebaId)
                          ?.nombre || "",
                    },
                  ],
            }
          : s
      )
    );
  };

  const eliminarExamen = (solicitudId: number, tipoPruebaId: number) => {
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.solicitud_id === solicitudId
          ? {
              ...s,
              examenes: s.examenes.filter(
                (e) => e.tipo_prueba_id !== tipoPruebaId
              ),
            }
          : s
      )
    );
  };

  const eliminarSolicitud = (solicitudId: number) => {
    setSolicitudes((prev) =>
      prev.filter((sol) => sol.solicitud_id !== solicitudId)
    );
  };

  return (
    <div className="space-y-4">
      {mode !== "view" && (
        <div className="flex gap-2">
          <Button
            onClick={agregarSolicitud}
            variant="outline"
            type="button"
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" /> Nueva Solicitud
          </Button>
        </div>
      )}

      {solicitudes.map((sol) => (
        <div key={sol.solicitud_id} className="border p-4 rounded-lg relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-semibold">
                Solicitud #{sol.solicitud_id}
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded ${
                    sol.estado === "Pendiente"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {sol.estado}
                </span>
              </h4>
              <p className="text-sm text-gray-600">
                Creada: {new Date(sol.fecha).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              {mode === "new" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => eliminarSolicitud(sol.solicitud_id)}
                  type="button"
                >
                  Eliminar
                </Button>
              )}
              {sol.estado === "Finalizado" && (
                <Button variant="outline" size="sm" type="button">
                  <Eye className="mr-1 h-4 w-4" /> Ver Resultados
                </Button>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexDirection: "column",
            }}
          >
            <Input
              label="Motivo"
              placeholder="Motivo de la solicitud..."
              value={sol.motivo}
              disabled={mode === "view"}
              required
              onChange={(e) =>
                setSolicitudes((prev) =>
                  prev.map((s) =>
                    s.solicitud_id === sol.solicitud_id
                      ? { ...s, motivo: e.target.value }
                      : s
                  )
                )
              }
            />
            <Textarea
              label="Observación"
              placeholder="Entrada de observación..."
              value={sol.observacion}
              disabled={mode === "view"}
              required
              onChange={(e) =>
                setSolicitudes((prev) =>
                  prev.map((s) =>
                    s.solicitud_id === sol.solicitud_id
                      ? { ...s, observacion: e.target.value }
                      : s
                  )
                )
              }
            />
            <div className="mt-2">
              <label className="text-sm font-medium text-foreground">
                Agregar Examen <span className="text-red-500">*</span>
              </label>
              {mode !== "view" && (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  onChange={(e) =>
                    handleExamChange(sol.solicitud_id, Number(e.target.value))
                  }
                  value=""
                  disabled={
                    tipoPruebas.filter(
                      (tp) =>
                        !sol.examenes.some(
                          (e) => e.tipo_prueba_id === tp.tipo_id
                        )
                    ).length === 0
                  }
                >
                  <option value="" disabled>
                    Seleccione un examen
                  </option>
                  {tipoPruebas
                    .filter(
                      (tp) =>
                        !sol.examenes.some(
                          (e) => e.tipo_prueba_id === tp.tipo_id
                        )
                    )
                    .map((tp) => (
                      <option key={tp.tipo_id} value={tp.tipo_id}>
                        {tp.nombre}
                      </option>
                    ))}
                </select>
              )}
            </div>
            <ul className="mt-2">
              {sol.examenes.map((examen) => (
                <li
                  key={examen.tipo_prueba_id}
                  className="flex justify-between items-center"
                >
                  <span>{examen.nombre}</span>
                  {mode !== "view" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        eliminarExamen(sol.solicitud_id, examen.tipo_prueba_id)
                      }
                      type="button"
                      disabled={getIsExamenesInInitialData(
                        sol.solicitud_id,
                        examen.tipo_prueba_id
                      )}
                    >
                      Eliminar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
