"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Database } from "lucide-react";

interface DbStatusData {
  connected: boolean;
  error: string | null;
  usingMemoryData: boolean;
}

export function DbStatus() {
  const [status, setStatus] = useState<DbStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/db-status");

        if (!response.ok) {
          throw new Error(`Error al verificar el estado de la base de datos: ${response.status}`);
        }

        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        console.error("Error al verificar el estado de la base de datos:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    checkDbStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Database className="h-5 w-5 animate-pulse" />
        <span>Verificando conexión a la base de datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <span>Error al verificar la conexión: {error}</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-2 flex items-center">
        <Database className="h-5 w-5 mr-2" />
        Estado de la Base de Datos
      </h3>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {status.connected ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600">Conectado a la base de datos</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600">No conectado a la base de datos</span>
            </>
          )}
        </div>

        {status.error && <div className="text-red-500 text-sm mt-1">Error: {status.error}</div>}

        {status.usingMemoryData && (
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm mt-2">
            ⚠️ Usando datos en memoria como respaldo. Algunas funcionalidades pueden estar limitadas.
          </div>
        )}
      </div>
    </div>
  );
}
