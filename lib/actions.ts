"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"
import { estados, ciudades, municipios } from "./data"

// Función para registrar un nuevo paciente
export async function registrarPaciente(formData: FormData) {
  // Obtener los datos del formulario
  const nombre = formData.get("nombre") as string
  const apellido = formData.get("apellido") as string
  const genero = formData.get("genero") as string
  const tipo_cedula = formData.get("tipo_cedula") as string
  const cedula = formData.get("cedula") as string
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string
  const estado = formData.get("estado") as string
  const ciudad = formData.get("ciudad") as string
  const municipio = formData.get("municipio") as string
  const direccion = formData.get("direccion") as string
  const email = formData.get("email") as string
  const telefono = formData.get("telefono") as string

  // Validar la cédula según el tipo
  if (tipo_cedula === "V" && (cedula.length < 5 || cedula.length > 8)) {
    throw new Error("La cédula venezolana debe tener entre 5 y 8 dígitos")
  }

  if (tipo_cedula === "E" && cedula.length > 20) {
    throw new Error("La cédula extranjera no puede tener más de 20 dígitos")
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
  }

  // Guardar en la base de datos
  try {
    const pacienteGuardado = await db.agregarPaciente(nuevoPaciente)
    console.log("Paciente registrado:", pacienteGuardado)

    // Revalidar la ruta de pacientes para actualizar la lista
    revalidatePath("/pacientes")

    // Redirigir a la lista de pacientes
    redirect("/pacientes")
  } catch (error) {
    console.error("Error al registrar paciente:", error)
    throw error
  }
}

// Función para guardar una consulta odontológica
export async function guardarConsulta(formData: FormData) {
  // Obtener los datos del formulario
  const paciente_id = Number(formData.get("paciente_id"))
  const odontologo_id = Number(formData.get("odontologo_id"))
  const motivo = formData.get("motivo") as string
  const odontodiagrama = JSON.parse(formData.get("odontodiagrama") as string)

  // Crear el objeto consulta
  const nuevaConsulta = {
    paciente_id,
    odontologo_id,
    fecha: new Date().toISOString().split("T")[0],
    motivo,
    odontodiagrama,
  }

  // Guardar en la base de datos
  try {
    // Usar directamente la función de la base de datos en lugar de fetch
    const consultaGuardada = await db.agregarConsulta(nuevaConsulta)
    console.log("Consulta guardada:", consultaGuardada)

    // Revalidar la ruta de consultas para actualizar la lista
    revalidatePath("/consultas-odontologicas")

    // Redirigir a la lista de consultas
    redirect("/consultas-odontologicas")
  } catch (error) {
    console.error("Error al registrar consulta:", error)
    throw error
  }
}

// Función para actualizar una consulta odontológica
export async function actualizarConsulta(id: number, data: any) {
  try {
    // Usar directamente la función de la base de datos en lugar de fetch
    const consultaActualizada = await db.actualizarConsulta(id, data)

    // Revalidar la ruta de consultas para actualizar la lista
    revalidatePath("/consultas-odontologicas")
    revalidatePath(`/consultas-odontologicas/${id}`)

    return consultaActualizada
  } catch (error) {
    console.error("Error al actualizar consulta:", error)
    throw error
  }
}

// Función para eliminar una consulta odontológica
export async function eliminarConsulta(id: number) {
  try {
    // Usar directamente la función de la base de datos en lugar de fetch
    const resultado = await db.eliminarConsulta(id)

    // Revalidar la ruta de consultas para actualizar la lista
    revalidatePath("/consultas-odontologicas")

    return resultado
  } catch (error) {
    console.error("Error al eliminar consulta:", error)
    throw error
  }
}

// Función para buscar pacientes
export async function buscarPacientes(query: string) {
  try {
    const pacientes = await db.getPacientesPorNombre(query)
    return pacientes
  } catch (error) {
    console.error("Error al buscar pacientes:", error)
    return []
  }
}

// Función para obtener todas las consultas
export async function getConsultas() {
  try {
    const consultas = await db.getConsultas()
    return consultas
  } catch (error) {
    console.error("Error al obtener consultas:", error)
    return []
  }
}

// Función para obtener todos los pacientes
export async function getPacientes() {
  try {
    const pacientes = await db.getPacientes()
    return pacientes
  } catch (error) {
    console.error("Error al obtener pacientes:", error)
    return []
  }
}

// Función para obtener los estados
export async function getEstados() {
  return estados
}

// Función para obtener las ciudades por estado
export async function getCiudadesPorEstado(estadoId: number) {
  return ciudades[estadoId] || []
}

// Función para obtener los municipios por ciudad
export async function getMunicipiosPorCiudad(ciudadId: number) {
  return municipios[ciudadId] || []
}
