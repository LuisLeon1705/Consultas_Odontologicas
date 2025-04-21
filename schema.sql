-- Esquema de la base de datos para el sistema odontológico

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS sistema_odontologico;
USE sistema_odontologico;

-- Tabla de estados
CREATE TABLE IF NOT EXISTS estados (
  estado_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

-- Tabla de ciudades
CREATE TABLE IF NOT EXISTS ciudades (
  ciudad_id INT AUTO_INCREMENT PRIMARY KEY,
  estado_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (estado_id) REFERENCES estados(estado_id)
);

-- Tabla de municipios
CREATE TABLE IF NOT EXISTS municipios (
  municipio_id INT AUTO_INCREMENT PRIMARY KEY,
  ciudad_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(ciudad_id)
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  paciente_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  genero ENUM('masculino', 'femenino', 'otro') NOT NULL,
  cedula VARCHAR(30) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  direccion TEXT NOT NULL,
  email VARCHAR(100),
  telefono VARCHAR(20) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de empleados (odontólogos)
CREATE TABLE IF NOT EXISTS empleados (
  empleado_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cargo VARCHAR(50) NOT NULL,
  cargo VARCHAR(100),
  email VARCHAR(100),
  telefono VARCHAR(20) NOT NULL,
  fecha_contratacion DATE NOT NULL
);

-- Tabla de historiales odontológicos
CREATE TABLE IF NOT EXISTS historiales_odontologicos (
  historial_id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(paciente_id)
);

-- Tabla de consultas odontológicas
CREATE TABLE IF NOT EXISTS consultas_odontologicas (
  consulta_id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  odontologo_id INT NOT NULL,
  fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  historial_id INT NOT NULL,
  motivo TEXT NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(paciente_id),
  FOREIGN KEY (odontologo_id) REFERENCES empleados(empleado_id),
  FOREIGN KEY (historial_id) REFERENCES historiales_odontologicos(historial_id)
);

-- Tabla de odontodiagrama
CREATE TABLE IF NOT EXISTS odontodiagrama (
  odontodiagrama_id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  historial_id INT NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(paciente_id),
  FOREIGN KEY (historial_id) REFERENCES historiales_odontologicos(historial_id)
);

-- Tabla de sectores del odontodiagrama
CREATE TABLE IF NOT EXISTS sectores (
  sector_id INT AUTO_INCREMENT PRIMARY KEY,
  odontodiagrama_id INT NOT NULL,
  nombre_sector VARCHAR(50) NOT NULL,
  FOREIGN KEY (odontodiagrama_id) REFERENCES odontodiagrama(odontodiagrama_id)
);

-- Tabla de dientes
CREATE TABLE IF NOT EXISTS dientes (
  diente_id INT AUTO_INCREMENT PRIMARY KEY,
  sector_id INT NOT NULL,
  numero_diente INT NOT NULL,
  FOREIGN KEY (sector_id) REFERENCES sectores(sector_id)
);

-- Tabla de segmentos de dientes
CREATE TABLE IF NOT EXISTS segmentos (
  segmento_id INT AUTO_INCREMENT PRIMARY KEY,
  diente_id INT NOT NULL,
  numero_segmento INT NOT NULL,
  valor_afectacion INT NOT NULL DEFAULT 0,
  FOREIGN KEY (diente_id) REFERENCES dientes(diente_id)
);

-- Insertar estados de Venezuela
INSERT INTO estados (nombre) VALUES
('Amazonas'),
('Anzoátegui'),
('Apure'),
('Aragua'),
('Barinas'),
('Bolívar'),
('Carabobo'),
('Cojedes'),
('Delta Amacuro'),
('Distrito Capital'),
('Falcón'),
('Guárico'),
('Lara'),
('Mérida'),
('Miranda'),
('Monagas'),
('Nueva Esparta'),
('Portuguesa'),
('Sucre'),
('Táchira'),
('Trujillo'),
('La Guaira'),
('Yaracuy'),
('Zulia');

-- Insertar un odontólogo por defecto
INSERT INTO empleados (nombre, apellido, cargo, cargo, email, telefono, fecha_contratacion)
VALUES ('Admin', 'Sistema', 'Odontólogo', 'General', 'admin@sistema.com', '0000-0000000', CURDATE());
