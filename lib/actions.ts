"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ciudades, estados, municipios } from "./data";
import { db } from "./db";

// Función para registrar un nuevo paciente
export async function registrarPaciente(formData: FormData) {
  // Obtener los datos del formulario
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const genero = formData.get("genero") as string;
  const tipo_cedula = formData.get("tipo_cedula") as string;
  const cedula = formData.get("cedula") as string;
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
  const estado = formData.get("estado") as string;
  const ciudad = formData.get("ciudad") as string;
  const municipio = formData.get("municipio") as string;
  const direccion = formData.get("direccion") as string;
  const email = formData.get("email") as string;
  const telefono = formData.get("telefono") as string;

  // Validar la cédula según el tipo
  if (tipo_cedula === "V" && (cedula.length < 5 || cedula.length > 8)) {
    throw new Error("La cédula venezolana debe tener entre 5 y 8 dígitos");
  }

  if (tipo_cedula === "E" && cedula.length > 20) {
    throw new Error("La cédula extranjera no puede tener más de 20 dígitos");
  }

  // Crear el objeto paciente
  const nuevoPaciente = {
    nombre,
    apellido,
    genero,
    tipo_cedula,
    cedula,
    fecha_nacimiento,
    estado,
    ciudad,
    municipio,
    direccion,
    email,
    telefono,
  };

  // Guardar en la base de datos
  try {
    const pacienteGuardado = await db.agregarPaciente(nuevoPaciente);
    console.log("Paciente registrado:", pacienteGuardado);

    // Revalidar la ruta de pacientes para actualizar la lista
    revalidatePath("/pacientes");

    // Redirigir a la lista de pacientes
    redirect("/pacientes");
  } catch (error) {
    console.error("Error al registrar paciente:", error);
    throw error;
  }
}

// Función para guardar una consulta odontológica
export async function guardarConsulta(formData: any) {
  try {
    if (!formData.paciente_id || !formData.odontologo_id || !formData.motivo) {
      throw new Error("Faltan datos requeridos");
    }

    // Save the consultation
    const nuevaConsulta = await db.agregarConsulta(formData);
    // Save associated laboratories if provided
    if (formData.laboratorios && Array.isArray(formData.laboratorios)) {
      for (const laboratorio of formData.laboratorios) {
        const solicitud = {
          paciente_id: formData.paciente_id,
          medico_id: formData.odontologo_id,
          motivo: laboratorio.motivo,
          estado: "Pendiente",
          fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
          observacion: laboratorio.observacion,
          consulta_id: nuevaConsulta.id,
        };
        console.log("Solicitud de laboratorio:", laboratorio);
        const examenes = laboratorio.examenes || [];
        await db.crearLaboratorio(solicitud, examenes);
      }
    }
    return nuevaConsulta;
  } catch (error) {
    console.error("Error al guardar la consulta:", error);
    throw error;
  }
}

// Función para actualizar una consulta odontológica
export async function actualizarConsulta(id: number, data: any) {
  try {
    // Usar directamente la función de la base de datos en lugar de fetch
    const consultaActualizada = await db.actualizarConsulta(id, data);

    // Revalidar la ruta de consultas para actualizar la lista
    revalidatePath("/consultas-odontologicas");
    revalidatePath(`/consultas-odontologicas/${id}`);

    return consultaActualizada;
  } catch (error) {
    console.error("Error al actualizar consulta:", error);
    throw error;
  }
}

// Función para eliminar una consulta odontológica
export async function eliminarConsulta(id: number) {
  try {
    // Usar directamente la función de la base de datos en lugar de fetch
    const resultado = await db.eliminarConsulta(id);

    // Revalidar la ruta de consultas para actualizar la lista
    revalidatePath("/consultas-odontologicas");

    return resultado;
  } catch (error) {
    console.error("Error al eliminar consulta:", error);
    throw error;
  }
}

// Función para buscar pacientes
export async function buscarPacientes(query: string) {
  try {
    const pacientes = await db.getPacientesPorNombre(query);
    return pacientes;
  } catch (error) {
    console.error("Error al buscar pacientes:", error);
    return [];
  }
}

// Función para obtener todas las consultas
export async function getConsultas() {
  try {
    const consultas = await db.getConsultas();
    return consultas;
  } catch (error) {
    console.error("Error al obtener consultas:", error);
    return [];
  }
}

// Función para obtener todos los pacientes
export async function getPacientes() {
  try {
    const pacientes = await db.getPacientes();
    return pacientes;
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    return [];
  }
}

// Función para obtener los estados
export async function getEstados() {
  return estados;
}

// Función para obtener las ciudades por estado
export async function getCiudadesPorEstado(estadoId: number) {
  return ciudades[estadoId] || [];
}

// Función para obtener los municipios por ciudad
export async function getMunicipiosPorCiudad(ciudadId: number) {
  return municipios[ciudadId] || [];
}

export async function crearSolicitudLaboratorio(data: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/laboratorios`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error creando solicitud:", error);
    throw error;
  }
}

export async function actualizarSolicitudLaboratorio(id: number, data: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/laboratorios/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error actualizando solicitud:", error);
    throw error;
  }
}

export async function eliminarSolicitudLaboratorio(id: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/laboratorios/${id}`,
      {
        method: "DELETE",
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error eliminando solicitud:", error);
    throw error;
  }
}

// Función para obtener todos los exámenes
export async function getExamenes(solicitudId?: number) {
  try {
    const url = solicitudId
      ? `/api/examenes?solicitudId=${solicitudId}`
      : "/api/examenes";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener exámenes");
    return await response.json();
  } catch (error) {
    console.error("Error al obtener exámenes:", error);
    throw error;
  }
}

// Función para crear un nuevo examen
export async function crearExamen(data: {
  solicitud_id: number;
  tipo_prueba_id: number;
  fecha: string;
}) {
  try {
    const response = await fetch("/api/examenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear examen");
    return await response.json();
  } catch (error) {
    console.error("Error al crear examen:", error);
    throw error;
  }
}

// Función para actualizar un examen
export async function actualizarExamen(data: {
  examen_id: number;
  tipo_prueba_id: number;
  fecha: string;
}) {
  try {
    const response = await fetch("/api/examenes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar examen");
    return await response.json();
  } catch (error) {
    console.error("Error al actualizar examen:", error);
    throw error;
  }
}

// Función para eliminar un examen
export async function eliminarExamen(examen_id: number) {
  try {
    const response = await fetch("/api/examenes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examen_id }),
    });
    if (!response.ok) throw new Error("Error al eliminar examen");
    return await response.json();
  } catch (error) {
    console.error("Error al eliminar examen:", error);
    throw error;
  }
}

// Función para obtener todos los tipos de prueba
export async function getTipoPruebas() {
  try {
    const response = await fetch("/api/tipo_prueba");
    if (!response.ok) throw new Error("Error al obtener tipos de prueba");
    return await response.json();
  } catch (error) {
    console.error("Error al obtener tipos de prueba:", error);
    throw error;
  }
}

// Función para obtener solicitudes de laboratorio
export async function getLaboratorios(consultaId?: number, tipo?: string) {
  try {
    const url = `/api/laboratorios?${
      consultaId ? `consultaId=${consultaId}&` : ""
    }${tipo ? `tipo=${tipo}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener laboratorios");
    return await response.json();
  } catch (error) {
    console.error("Error al obtener laboratorios:", error);
    throw error;
  }
}

// Función para crear una nueva solicitud de laboratorio
export async function crearLaboratorio(data: {
  solicitud: any;
  examenes: any[];
}) {
  try {
    const response = await fetch("/api/laboratorios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new Error("Error al crear solicitud de laboratorio");
    return await response.json();
  } catch (error) {
    console.error("Error al crear solicitud de laboratorio:", error);
    throw error;
  }
}
