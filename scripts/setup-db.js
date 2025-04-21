const fs = require("fs")
const path = require("path")
const mysql = require("mysql2/promise")
const readline = require("readline")

// Función para leer las credenciales de la base de datos
async function getCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const question = (query) => new Promise((resolve) => rl.question(query, resolve))

  console.log("Configuración de la base de datos:")
  const host = (await question("Host (default: localhost): ")) || "localhost"
  const user = (await question("Usuario (default: root): ")) || "root"
  const password = await question("Contraseña: ")
  const database =
    (await question("Nombre de la base de datos (default: sistema_odontologico): ")) || "sistema_odontologico"

  rl.close()

  return { host, user, password, database }
}

// Función para dividir el script SQL en consultas individuales
function splitSqlQueries(sqlScript) {
  // Dividir por punto y coma, pero tener cuidado con las cadenas de texto
  const queries = []
  let currentQuery = ""
  let inString = false
  let stringChar = ""

  for (let i = 0; i < sqlScript.length; i++) {
    const char = sqlScript[i]

    // Manejar comillas para detectar cadenas de texto
    if ((char === "'" || char === '"') && (i === 0 || sqlScript[i - 1] !== "\\")) {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
    }

    // Agregar el carácter a la consulta actual
    currentQuery += char

    // Si encontramos un punto y coma fuera de una cadena, es el final de una consulta
    if (char === ";" && !inString) {
      queries.push(currentQuery.trim())
      currentQuery = ""
    }
  }

  // Agregar la última consulta si existe
  if (currentQuery.trim()) {
    queries.push(currentQuery.trim())
  }

  return queries.filter((q) => q.length > 0)
}

// Función para crear la base de datos y ejecutar el script SQL
async function setupDatabase() {
  try {
    // Obtener credenciales
    const credentials = await getCredentials()

    // Crear conexión sin especificar base de datos
    const connection = await mysql.createConnection({
      host: credentials.host,
      user: credentials.user,
      password: credentials.password,
    })

    console.log("Conexión establecida con MySQL")

    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${credentials.database}`)
    console.log(`Base de datos '${credentials.database}' creada o ya existente`)

    // Usar la base de datos
    await connection.query(`USE ${credentials.database}`)
    console.log(`Usando base de datos '${credentials.database}'`)

    // Verificar si existe el archivo datos.sql
    const sqlFilePath = path.join(__dirname, "..", "datos.sql")
    if (!fs.existsSync(sqlFilePath)) {
      console.error("Error: El archivo datos.sql no existe en la raíz del proyecto")
      await connection.end()
      return
    }

    // Leer el archivo SQL
    const sqlScript = fs.readFileSync(sqlFilePath, "utf8")

    // Dividir el script en consultas individuales
    const queries = splitSqlQueries(sqlScript)

    // Ejecutar cada consulta
    console.log("Ejecutando script SQL...")
    for (const query of queries) {
      try {
        await connection.query(query)
      } catch (error) {
        console.error("Error al ejecutar consulta SQL:", error)
        console.error("Consulta problemática:", query.substring(0, 150) + "...")
        // Continuar con la siguiente consulta
      }
    }

    console.log("Script SQL ejecutado correctamente")

    // Crear archivo .env con las credenciales
    const envContent = `
DB_HOST=${credentials.host}
DB_USER=${credentials.user}
DB_PASSWORD=${credentials.password}
DB_NAME=${credentials.database}
PORT=4000
`

    fs.writeFileSync(path.join(__dirname, "..", ".env.local"), envContent)
    console.log("Archivo .env.local creado con las credenciales")

    // Cerrar conexión
    await connection.end()
    console.log("Configuración completada con éxito")
  } catch (error) {
    console.error("Error durante la configuración:", error)
  }
}

// Ejecutar la configuración
setupDatabase()
