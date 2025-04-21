# Sistema Odontológico

Este es un sistema de gestión odontológica que permite registrar pacientes, consultas y utilizar un odontodiagrama interactivo.

## Requisitos

- Node.js 14.x o superior
- MySQL 5.7 o superior

## Instalación

1. Clona este repositorio:
\`\`\`bash
git clone <url-del-repositorio>
cd sistema-odontologico
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Coloca el archivo `datos.sql` en la raíz del proyecto.

4. Configura la base de datos:
\`\`\`bash
npm run setup-db
\`\`\`
Este comando te pedirá las credenciales de tu base de datos MySQL y ejecutará el script SQL para crear las tablas necesarias.

5. Inicia el servidor:
\`\`\`bash
npm start
\`\`\`

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Características

- Registro de pacientes con validación de cédula venezolana y extranjera
- Gestión de consultas odontológicas
- Odontodiagrama interactivo con 7 segmentos por diente
- Búsqueda de pacientes
- Historial de consultas

## Estructura del Proyecto

- `server.js`: Punto de entrada de la aplicación Express
- `public/`: Archivos estáticos (HTML, CSS, JavaScript)
- `scripts/`: Scripts de utilidad, como la configuración de la base de datos

## Configuración de la Base de Datos

1. Coloca el archivo `datos.sql` en la raíz del proyecto.

2. Configura la base de datos:
\`\`\`bash
npm run setup-db
\`\`\`
Este comando te pedirá las credenciales de tu base de datos MySQL y ejecutará el script SQL para crear las tablas necesarias y cargar los datos iniciales.

3. El script creará un archivo `.env.local` con las credenciales de la base de datos. Si necesitas modificar estas credenciales posteriormente, puedes editar este archivo.

## Variables de Entorno

El sistema utiliza las siguientes variables de entorno:

- `DB_HOST`: Host de la base de datos (por defecto: "localhost")
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos (por defecto: "sistema_odontologico")
- `PORT`: Puerto en el que se ejecutará el servidor (por defecto: 3000)

Estas variables pueden configurarse en el archivo `.env.local` o como variables de entorno del sistema.

## Uso

1. Registra pacientes desde la sección "Pacientes" > "Registrar Paciente"
2. Crea consultas odontológicas desde "Consultas Odontológicas" > "Nueva Consulta"
3. Utiliza el odontodiagrama para marcar el estado de los dientes
4. Consulta el historial de pacientes y consultas

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
