"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { wrap } from "module";
import { useEffect, useState } from "react";

// Tipados para los datos
type Segmentos = Record<number, number>;
interface Diente {
  segmentos: Segmentos;
}

interface SectorData {
  dientes: Diente[];
}

interface OdontodiagramaProps {
  onChange: (data: Record<number, SectorData>) => void;
  readOnly?: boolean;
  initialData?: Record<
    number,
    { dientes: Record<number, { segmentos: Record<number, number> }> }
  >;
}

export function Odontodiagrama({
  onChange,
  readOnly = false,
  initialData,
}: OdontodiagramaProps) {
  // Estado de los sectores (1-4 superiores e inferiores, 5-8 internos)
  const [sectores, setSectores] = useState<Record<number, SectorData>>(() => {
    const result: Record<number, SectorData> = {};
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((sectorKey) => {
      const count = sectorKey <= 4 ? 8 : 5; // sectores 1-4: 8 dientes; 5-8: 5 dientes
      if (initialData && initialData[sectorKey]?.dientes) {
        const dientesArray = Object.entries(initialData[sectorKey].dientes)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, d]) => ({ segmentos: { ...d.segmentos } }));
        result[sectorKey] = { dientes: dientesArray };
      } else {
        result[sectorKey] = {
          dientes: Array.from({ length: count }, () => ({
            segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
          })),
        };
      }
    });
    return result;
  });

  // Valor seleccionado para segmento
  const [valorSeleccionado, setValorSeleccionado] = useState<number>(1);

  useEffect(() => {
    onChange(sectores);
  }, []);

  useEffect(() => {
    onChange(sectores);
  }, [sectores, onChange]);

  // Cambiar valor de un segmento
  const cambiarSegmento = (
    sector: number,
    dienteIndex: number,
    segmento: number
  ) => {
    if (readOnly) return;
    setSectores((prev) => {
      const copia = { ...prev };
      copia[sector].dientes[dienteIndex].segmentos[segmento] =
        valorSeleccionado;
      return copia;
    });
  };

  // Agregar diente al final
  const agregarDiente = (sector: number) => {
    if (readOnly) return;
    setSectores((prev) => {
      const copia = { ...prev };
      copia[sector] = {
        dientes: [
          ...copia[sector].dientes,
          { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        ],
      };
      return copia;
    });
  };

  // Eliminar diente por índice
  const eliminarDiente = (sector: number, index: number) => {
    if (readOnly) return;
    setSectores((prev) => {
      const copia = { ...prev };
      copia[sector] = {
        dientes: copia[sector].dientes.filter((_, i) => i !== index),
      };
      return copia;
    });
  };

  // Path SVG para cada segmento
  const getSegmentPath = (segmento: number) => {
    const cx = 25;
    const cy = 25;
    const rInner = 8;
    const rOuter = 20;
    const rExt = 30;
    switch (segmento) {
      case 1:
        return `M ${cx} ${cy} m -${rInner},0 a ${rInner},${rInner} 0 1,0 ${
          rInner * 2
        },0 a ${rInner},${rInner} 0 1,0 -${rInner * 2},0`;
      case 2:
        return `M ${cx} ${cy - rInner} A ${rInner} ${rInner} 0 0 1 ${
          cx + rInner
        } ${cy} L ${cx + rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 0 ${cx} ${
          cy - rOuter
        } Z`;
      case 3:
        return `M ${cx + rInner} ${cy} A ${rInner} ${rInner} 0 0 1 ${cx} ${
          cy + rInner
        } L ${cx} ${cy + rOuter} A ${rOuter} ${rOuter} 0 0 0 ${
          cx + rOuter
        } ${cy} Z`;
      case 4:
        return `M ${cx} ${cy + rInner} A ${rInner} ${rInner} 0 0 1 ${
          cx - rInner
        } ${cy} L ${cx - rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 0 ${cx} ${
          cy + rOuter
        } Z`;
      case 5:
        return `M ${cx - rInner} ${cy} A ${rInner} ${rInner} 0 0 1 ${cx} ${
          cy - rInner
        } L ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 0 0 ${
          cx - rOuter
        } ${cy} Z`;
      case 6:
        return `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 0 1 ${
          cx + rOuter
        } ${cy} L ${cx + rExt * 0.7071} ${
          cy - rExt * 0.7071
        } A ${rExt} ${rExt} 0 0 0 ${cx - rExt * 0.7071} ${
          cy - rExt * 0.7071
        } L ${cx - rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 1 ${cx} ${
          cy - rOuter
        } Z`;
      case 7:
        return `M ${cx} ${cy + rOuter} A ${rOuter} ${rOuter} 0 0 1 ${
          cx - rOuter
        } ${cy} L ${cx - rExt * 0.7071} ${
          cy + rExt * 0.7071
        } A ${rExt} ${rExt} 0 0 0 ${cx + rExt * 0.7071} ${
          cy + rExt * 0.7071
        } L ${cx + rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 1 ${cx} ${
          cy + rOuter
        } Z`;
      default:
        return "";
    }
  };

  // Render de un segmento
  const renderSegmento = (
    sector: number,
    index: number,
    segmento: number,
    valor: number
  ) => {
    let fillClass = "fill-white";
    let strokeColor = "stroke-gray-800";
    let strokeWidth = "";
    switch (valor) {
      case 1:
        fillClass = "fill-red-500";
        break;
      case 2:
        fillClass = "fill-blue-500";
        break;
      case 3:
        fillClass = "fill-blue-500";
        strokeColor = "stroke-red-600";
        strokeWidth = " stroke-2";
        break;
      case 4:
        fillClass = "fill-black";
        break;
      case 5:
        fillClass = "fill-green-500";
        break;
      case 6:
        fillClass = "fill-orange-500";
        break;
      case 7:
        fillClass = "fill-purple-500";
        break;
      case 8:
        fillClass = "fill-yellow-300";
        break;
    }
    return (
      <path
        key={`${sector}-${index}-${segmento}`}
        className={`${strokeColor}${strokeWidth} ${fillClass} cursor-pointer hover:opacity-80`}
        d={getSegmentPath(segmento)}
        onClick={() => cambiarSegmento(sector, index, segmento)}
      />
    );
  };

  // Render de un diente completo
  const renderDiente = (sector: number, diente: Diente, index: number) => (
    <div key={index} className="relative">
      <div className="text-center text-xs mb-1">{`${sector}${index + 1}`}</div>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <g transform="translate(5, 5)">
          <circle
            cx="25"
            cy="25"
            r="24"
            className="stroke-gray-300 fill-none stroke-[0.5]"
          />
          {Object.entries(diente.segmentos).map(([seg, val]) =>
            renderSegmento(sector, index, Number(seg), val as number)
          )}
        </g>
      </svg>
      {!readOnly && (
        <button
          type="button"
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
          onClick={() => eliminarDiente(sector, index)}
        >
          ×
        </button>
      )}
    </div>
  );

  // Render de un sector
  const renderSector = (sector: number, data: SectorData) => {
    // Determinar si es sector izquierdo para invertir orden de dientes
    const isLeftSector = [2, 4, 6, 8].includes(sector);
    const dientes = data.dientes;
    const total = data.dientes.length;

    let title = `Sector ${sector}`;
    if (sector === 1) title += " Superior Derecho";
    if (sector === 2) title += " Superior Izquierdo";
    if (sector === 3) title += " Inferior Derecho";
    if (sector === 4) title += " Inferior Izquierdo";
    if (sector === 5) title += " Interno Sup Derecho";
    if (sector === 6) title += " Interno Sup Izquierdo";
    if (sector === 7) title += " Interno Inf Izquierdo";
    if (sector === 8) title += " Interno Inf Derecho";

    return (
      <div className="border p-4 rounded-md" key={sector}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{title}</h3>
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => agregarDiente(sector)}
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar Diente
            </Button>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isLeftSector ? "row-reverse" : "row",
            gap: "1em",
            justifyContent: isLeftSector ? "flex-start" : "flex-start",
            flexWrap: "wrap",
          }}
        >
          {dientes.map((d, idx) => {
            const originalIdx = idx;
            return renderDiente(sector, data.dientes[originalIdx], originalIdx);
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {!readOnly && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Seleccionar estado:</h3>

          <div className="flex space-x-4">
            {[
              { v: 0, title: "Sin revisar", bg: "bg-white" },
              { v: 1, title: "Caries", bg: "bg-red-500" },
              { v: 2, title: "Restauracion", bg: "bg-blue-500" },
              { v: 3, title: "Restauracion Defectuosa", bg: "bg-blue-500" },
              { v: 4, title: "Ausente", bg: "bg-black" },
              { v: 5, title: "Sano", bg: "bg-green-500" },
              { v: 6, title: "Extraer Diente", bg: "bg-orange-500" },
              { v: 7, title: "Trat. Endodontico ind.", bg: "bg-purple-500" },
              { v: 8, title: "Trat. Endodontico real", bg: "bg-yellow-300" },
            ].map(({ v, title, bg }) => (
              <div key={v} className="flex flex-col items-center w-20">
                <button
                  type="button"
                  className={`w-8 h-8 rounded-full border ${
                    valorSeleccionado === v
                      ? "border-black border-2"
                      : "border-gray-300"
                  } ${bg}${v === 3 ? " border-2 border-red-600" : ""}`}
                  onClick={() => setValorSeleccionado(v)}
                  title={title}
                />
                <span className="text-xs text-center mt-1">{title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSector(2, sectores[2])}
        {renderSector(1, sectores[1])}
        {renderSector(6, sectores[6])}
        {renderSector(5, sectores[5])}
        {renderSector(8, sectores[8])}
        {renderSector(7, sectores[7])}
        {renderSector(4, sectores[4])}
        {renderSector(3, sectores[3])}
      </div>
    </div>
  );
}
