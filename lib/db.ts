import mysql from "mysql2/promise";
import { consultasData, pacientesData } from "./data";
import type { Consulta, Odontologo, Paciente } from "./types";

// Datos en memoria como respaldo
const pacientesEnMemoria: Paciente[] = [];
const consultasEnMemoria: Consulta[] = [];
const odontologosEnMemoria: Odontologo[] = [
  { id: 1, nombre: "Dr. Juan Pérez", cargo: "Odontología General" },
  { id: 2, nombre: "Dra. María López", cargo: "Ortodoncia" },
  { id: 3, nombre: "Dr. Carlos Rodríguez", cargo: "Endodoncia" },
];

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  // No usar contraseña si no se proporciona
  ...(process.env.DB_PASSWORD ? { password: process.env.DB_PASSWORD } : {}),
  database: process.env.DB_NAME || "sistema_odontologico",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Clase para manejar la base de datos
class Database {
  private static instance: Database;
  private _pool: mysql.Pool | null = null;
  private _useMemory = false;
  private _usingMemoryData = false;
  private _connectionError: string | null = null;
  private _memoryPacientes: any[] = [...pacientesData];
  private _memoryConsultas: any[] = [...consultasData];
  private _memoryOdontologos: any[] = [
    {
      id: 1,
      nombre: "Juan",
      apellido: "García",
      cedula: "V12345678",
      cargo: "General",
      email: "juan.garcia@example.com",
      telefono: "0412-1234567",
      fecha_nacimiento: "1980-01-01",
      fecha_contratacion: "2020-01-01",
      direccion: "Caracas, Venezuela",
      cargo: "Odontólogo",
    },
  ];

  private constructor() {
    this.initializePool();
  }

  // Patrón Singleton para asegurar una única instancia
  public static async getInstance(): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Database();
      await Database.instance.initialize();
    }
    return Database.instance;
  }

  private initializePool() {
    try {
      // Obtener variables de entorno
      const dbUser = process.env.DB_USER || "root";
      const dbHost = process.env.DB_HOST || "localhost";
      const dbName = process.env.DB_NAME || "sistema_odontologico";
      const dbPassword = process.env.DB_PASSWORD || "";

      this._pool = mysql.createPool({
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("Pool de conexiones inicializado correctamente");
      this._usingMemoryData = false;
      this._connectionError = null;
    } catch (error) {
      console.error("Error al inicializar el pool de conexiones:", error);
      this._pool = null;
      this._usingMemoryData = true;
      this._connectionError =
        error instanceof Error ? error.message : "Error desconocido";
    }
  }

  // Inicializar la conexión a la base de datos
  private async initialize() {
    try {
      // this._pool = await initPool()

      // Verificar si podemos conectarnos a la base de datos
      if (this._pool) {
        try {
          const connection = await this._pool.getConnection();
          connection.release();
          this._useMemory = false;
          console.log("Usando base de datos MySQL");
        } catch (error) {
          console.error("Error al obtener conexión del pool:", error);
          this._useMemory = true;
          console.log("Fallback a datos en memoria debido a error de conexión");
        }
      } else {
        this._useMemory = true;
        console.log("Usando datos en memoria");
      }
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error);
      this._useMemory = true;
      console.log("Usando datos en memoria como fallback");
    }
  }

  // Método para verificar si estamos usando memoria o base de datos
  public isUsingMemory() {
    return this._useMemory;
  }

  public async testConnection() {
    if (!this._pool) {
      return {
        connected: false,
        message:
          this._connectionError ||
          "No se ha inicializado el pool de conexiones",
        usingMemoryData: this._usingMemoryData,
      };
    }

    try {
      const connection = await this._pool.getConnection();
      connection.release();
      return {
        connected: true,
        message: null,
        usingMemoryData: this._usingMemoryData,
      };
    } catch (error) {
      console.error("Error al probar la conexión a la base de datos:", error);
      this._usingMemoryData = true;
      return {
        connected: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        usingMemoryData: this._usingMemoryData,
      };
    }
  }

  // Métodos para pacientes
  public async getPacientes() {
    if (this._useMemory) {
      console.log("Obteniendo pacientes desde memoria");
      return [...this._memoryPacientes];
    }

    try {
      console.log("Obteniendo pacientes desde la base de datos");
      const [rows] = await this._pool.query(`
        SELECT 
          paciente_id as id, 
          nombre, 
          apellido, 
          genero, 
          SUBSTRING(cedula, 1, 1) as tipo_cedula, 
          SUBSTRING(cedula, 2) as cedula, 
          fecha_nacimiento, 
          direccion, 
          email, 
          telefono 
        FROM pacientes
      `);
      return rows;
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      return [];
    }
  }

  public async getPacientePorId(id: number) {
    if (this._useMemory) {
      return this._memoryPacientes.find((p) => p.id === id);
    }

    try {
      const [rows] = await this._pool.query(
        `
        SELECT 
          paciente_id as id, 
          nombre, 
          apellido, 
          genero, 
          SUBSTRING(cedula, 1, 1) as tipo_cedula, 
          SUBSTRING(cedula, 2) as cedula, 
          fecha_nacimiento, 
          direccion, 
          email, 
          telefono 
        FROM pacientes 
        WHERE paciente_id = ?
      `,
        [id]
      );

      return rows[0];
    } catch (error) {
      console.error("Error al obtener paciente por ID:", error);
      return null;
    }
  }

  public async getPacientesPorNombre(query: string) {
    if (this._useMemory) {
      return this._memoryPacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.apellido.toLowerCase().includes(query.toLowerCase()) ||
          p.cedula.includes(query)
      );
    }

    try {
      const [rows] = await this._pool.query(
        `
        SELECT 
          paciente_id as id, 
          nombre, 
          apellido, 
          genero, 
          SUBSTRING(cedula, 1, 1) as tipo_cedula, 
          SUBSTRING(cedula, 2) as cedula, 
          fecha_nacimiento, 
          direccion, 
          email, 
          telefono 
        FROM pacientes 
        WHERE 
          nombre LIKE ? OR 
          apellido LIKE ? OR 
          cedula LIKE ?
      `,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );

      return rows;
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      return [];
    }
  }

  public async agregarPaciente(paciente: any) {
    if (this._useMemory) {
      const newId =
        this._memoryPacientes.length > 0
          ? Math.max(...this._memoryPacientes.map((p) => p.id)) + 1
          : 1;

      const nuevoPaciente = {
        ...paciente,
        id: newId,
      };

      this._memoryPacientes.push(nuevoPaciente);
      return nuevoPaciente;
    }

    try {
      // Combinar tipo_cedula y cedula para almacenar en la base de datos
      const cedulaCompleta = `${paciente.tipo_cedula}${paciente.cedula}`;

      const [result] = await this._pool.query(
        `
        INSERT INTO pacientes (
          nombre, 
          apellido, 
          genero, 
          cedula, 
          fecha_nacimiento, 
          direccion, 
          email, 
          telefono
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          paciente.nombre,
          paciente.apellido,
          paciente.genero,
          cedulaCompleta,
          paciente.fecha_nacimiento,
          `${paciente.estado}, ${paciente.ciudad}, ${paciente.municipio}, ${paciente.direccion}`,
          paciente.email,
          paciente.telefono,
        ]
      );

      return {
        id: result.insertId,
        ...paciente,
      };
    } catch (error) {
      console.error("Error al agregar paciente:", error);
      throw error;
    }
  }

  // Métodos para odontólogos
  public async getOdontologos() {
    if (this._useMemory) {
      return [...this._memoryOdontologos];
    }

    try {
      const [rows] = await this._pool.query(`
        SELECT 
          empleado_id as id, 
          nombre, 
          apellido, 
          cedula,
          cargo,
          email, 
          telefono,
          fecha_nacimiento,
          fecha_contratacion,
          direccion,
          cargo
        FROM empleados
        WHERE cargo = 'Odontólogo'
        ORDER BY nombre, apellido
      `);
      return rows;
    } catch (error) {
      console.error("Error al obtener odontólogos:", error);
      return [];
    }
  }

  public async getOdontologoPorId(id: number) {
    if (this._useMemory) {
      return this._memoryOdontologos.find((o) => o.id === id);
    }

    try {
      const [rows] = await this._pool.query(
        `
        SELECT 
          empleado_id as id, 
          nombre, 
          apellido, 
          cedula,
          email, 
          telefono,
          fecha_nacimiento,
          fecha_contratacion,
          direccion,
          cargo
        FROM empleados
        WHERE empleado_id = ? AND cargo = 'Odontólogo'
      `,
        [id]
      );

      return rows[0];
    } catch (error) {
      console.error("Error al obtener odontólogo por ID:", error);
      return null;
    }
  }

  public async agregarOdontologo(odontologo: any) {
    if (this._useMemory) {
      const newId =
        this._memoryOdontologos.length > 0
          ? Math.max(...this._memoryOdontologos.map((o) => o.id)) + 1
          : 1;

      const nuevoOdontologo = {
        ...odontologo,
        id: newId,
      };

      this._memoryOdontologos.push(nuevoOdontologo);
      return nuevoOdontologo;
    }

    try {
      const [result] = await this._pool.query(
        `
        INSERT INTO empleados (
          nombre, 
          apellido, 
          cedula, 
          email, 
          telefono,
          fecha_nacimiento,
          fecha_contratacion,
          direccion,
          cargo,
          rol_id,
          departamento_id,
          sueldo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1500)
      `,
        [
          odontologo.nombre,
          odontologo.apellido,
          odontologo.cedula,
          odontologo.email,
          odontologo.telefono,
          odontologo.fecha_nacimiento,
          odontologo.fecha_contratacion,
          odontologo.direccion,
          "Odontólogo",
        ]
      );

      return {
        id: result.insertId,
        ...odontologo,
      };
    } catch (error) {
      console.error("Error al agregar odontólogo:", error);
      throw error;
    }
  }

  public async actualizarOdontologo(id: number, odontologo: any) {
    if (this._useMemory) {
      const index = this._memoryOdontologos.findIndex((o) => o.id === id);
      if (index === -1) return null;

      this._memoryOdontologos[index] = {
        ...this._memoryOdontologos[index],
        ...odontologo,
      };

      return this._memoryOdontologos[index];
    }

    try {
      const [result] = await this._pool.query(
        `
        UPDATE empleados
        SET 
          nombre = ?, 
          apellido = ?, 
          cedula = ?, 
          cargo = ?,
          email = ?, 
          telefono = ?,
          fecha_nacimiento = ?,
          fecha_contratacion = ?,
          direccion = ?
        WHERE empleado_id = ? AND cargo = 'Odontólogo'
      `,
        [
          odontologo.nombre,
          odontologo.apellido,
          odontologo.cedula,
          odontologo.cargo || "General",
          odontologo.email,
          odontologo.telefono,
          odontologo.fecha_nacimiento,
          odontologo.fecha_contratacion,
          odontologo.direccion,
          id,
        ]
      );

      if (result.affectedRows === 0) return null;

      return {
        id,
        ...odontologo,
      };
    } catch (error) {
      console.error("Error al actualizar odontólogo:", error);
      throw error;
    }
  }

  public async eliminarOdontologo(id: number) {
    if (this._useMemory) {
      const index = this._memoryOdontologos.findIndex((o) => o.id === id);
      if (index === -1) return false;

      this._memoryOdontologos.splice(index, 1);
      return true;
    }

    try {
      const [result] = await this._pool.query(
        `
        DELETE FROM empleados
        WHERE empleado_id = ? AND cargo = 'Odontólogo'
      `,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al eliminar odontólogo:", error);
      throw error;
    }
  }

  // Métodos para consultas
  public async getConsultas() {
    if (this._useMemory) {
      // Enriquecer las consultas con datos de pacientes y odontólogos
      return this._memoryConsultas.map((consulta) => {
        const paciente = this._memoryPacientes.find(
          (p) => p.id === consulta.paciente_id
        );
        const odontologo = this._memoryOdontologos.find(
          (o) => o.id === consulta.odontologo_id
        );

        return {
          ...consulta,
          paciente: paciente
            ? `${paciente.nombre} ${paciente.apellido}`
            : "Desconocido",
          paciente_nombre: paciente?.nombre,
          paciente_apellido: paciente?.apellido,
          paciente_cedula: paciente
            ? `${paciente.tipo_cedula}-${paciente.cedula}`
            : "",
          odontologo: odontologo
            ? `${odontologo.nombre} ${odontologo.apellido}`
            : "No asignado",
          odontologo_nombre: odontologo?.nombre,
          odontologo_apellido: odontologo?.apellido,
        };
      });
    }

    try {
      const [rows] = await this._pool.query(`
        SELECT 
          co.consulta_id as id, 
          co.paciente_id, 
          co.odontologo_id,
          co.fecha_consulta as fecha, 
          co.motivo, 
          co.historial_id,
          CONCAT(e.nombre, ' ', e.apellido) as odontologo,
          e.nombre as odontologo_nombre,
          e.apellido as odontologo_apellido,
          CONCAT(p.nombre, ' ', p.apellido) as paciente,
          p.nombre as paciente_nombre,
          p.apellido as paciente_apellido,
          p.cedula as paciente_cedula
        FROM consultas_odontologicas co
        JOIN pacientes p ON co.paciente_id = p.paciente_id
        LEFT JOIN empleados e ON co.odontologo_id = e.empleado_id
        ORDER BY co.fecha_consulta DESC
      `);

      return rows;
    } catch (error) {
      console.error("Error al obtener consultas:", error);
      return [];
    }
  }

  public async getConsultaPorId(id: number) {
    if (this._useMemory) {
      const consulta = this._memoryConsultas.find((c) => c.id === id);
      if (!consulta) return null;

      const paciente = this._memoryPacientes.find(
        (p) => p.id === consulta.paciente_id
      );
      const odontologo = this._memoryOdontologos.find(
        (o) => o.id === consulta.odontologo_id
      );

      return {
        ...consulta,
        paciente: paciente
          ? `${paciente.nombre} ${paciente.apellido}`
          : "Desconocido",
        paciente_nombre: paciente?.nombre,
        paciente_apellido: paciente?.apellido,
        paciente_cedula: paciente
          ? `${paciente.tipo_cedula}-${paciente.cedula}`
          : "",
        odontologo: odontologo
          ? `${odontologo.nombre} ${odontologo.apellido}`
          : "No asignado",
        odontologo_nombre: odontologo?.nombre,
        odontologo_apellido: odontologo?.apellido,
      };
    }

    try {
      const [rows] = await this._pool.query(
        `
        SELECT 
          co.consulta_id as id, 
          co.paciente_id,
          co.odontologo_id, 
          co.fecha_consulta as fecha, 
          co.motivo,
          co.historial_id,
          CONCAT(e.nombre, ' ', e.apellido) as odontologo,
          e.nombre as odontologo_nombre,
          e.apellido as odontologo_apellido,
          CONCAT(p.nombre, ' ', p.apellido) as paciente,
          p.nombre as paciente_nombre,
          p.apellido as paciente_apellido,
          p.cedula as paciente_cedula
        FROM consultas_odontologicas co
        JOIN pacientes p ON co.paciente_id = p.paciente_id
        LEFT JOIN empleados e ON co.odontologo_id = e.empleado_id
        WHERE co.consulta_id = ?
      `,
        [id]
      );

      if (rows.length === 0) return null;

      const consulta = rows[0];

      // Obtener el odontodiagrama asociado a esta consulta
      try {
        const [odontodiagramaRows] = await this._pool.query(
          `
          SELECT 
            o.odontodiagrama_id
          FROM odontodiagrama o
          WHERE o.historial_id = ?
        `,
          [consulta.historial_id]
        );

        if (odontodiagramaRows.length > 0) {
          const odontodiagramaId = odontodiagramaRows[0].odontodiagrama_id;

          // Obtener los sectores
          const [sectoresRows] = await this._pool.query(
            `
            SELECT 
              sector_id,
              nombre_sector
            FROM sectores
            WHERE odontodiagrama_id = ?
            `,
            [odontodiagramaId]
          );

          // Estructura para almacenar el odontodiagrama completo
          const odontodiagrama: any = {};

          // Para cada sector, obtener sus dientes
          for (const sector of sectoresRows) {
            const sectorId = sector.sector_id;
            const sectorKey = sector.nombre_sector.split(" ")[1]; // Obtener el número del sector

            // Obtener los dientes del sector
            const [dientesRows] = await this._pool.query(
              `
              SELECT 
                diente_id,
                numero_diente
              FROM dientes
              WHERE sector_id = ?
              `,
              [sectorId]
            );

            // Inicializar el sector en el odontodiagrama
            odontodiagrama[sectorKey] = { dientes: {} };

            // Para cada diente, obtener sus segmentos
            for (const diente of dientesRows) {
              const dienteId = diente.diente_id;
              const dienteKey = diente.numero_diente;

              // Obtener los segmentos del diente
              const [segmentosRows] = await this._pool.query(
                `
                SELECT 
                  numero_segmento,
                  valor_afectacion
                FROM segmentos
                WHERE diente_id = ?
                `,
                [dienteId]
              );

              // Inicializar el diente en el sector
              odontodiagrama[sectorKey].dientes[dienteKey] = { segmentos: {} };

              // Agregar cada segmento al diente
              for (const segmento of segmentosRows) {
                odontodiagrama[sectorKey].dientes[dienteKey].segmentos[
                  segmento.numero_segmento
                ] = segmento.valor_afectacion;
              }
            }
          }
          // Agregar el odontodiagrama a la consulta
          consulta.odontodiagrama = odontodiagrama;
        }
        const [solicitudesRows] = await this._pool.query(
          `
          SELECT
            slo.solicitud_id,
            sl.motivo,
            sl.estado,
            sl.fecha,
            sl.observacion
          FROM
            solicitudes_lab_odontologicas slo
          join solicitudes_laboratorio sl on sl.solicitud_id = slo.solicitud_id
          where
            consulta_id = ?
          `,
          [consulta.id]
        );
        consulta.solicitudes = [];
        for (const solicitud of solicitudesRows) {
          const [examenesRows] = await this._pool.query(
            `
            select
              ex.examen_id,
              ex.fecha,
              ex.solicitud_id,
              ex.tipo_prueba_id,
              ex.path_resultados,
              tp.nombre
            from
              examenes ex
            JOIN 
              tipo_prueba tp on tp.tipo_id = ex.tipo_prueba_id
            where
              ex.solicitud_id = ?
          `,
            [solicitud.solicitud_id]
          );
          let examenes = [];
          for (const examen of examenesRows) {
            examenes.push({
              tipo_prueba_id: examen.tipo_prueba_id,
              nombre: examen.nombre,
            });
          }
          consulta.solicitudes.push({
            solicitud_id: solicitud.solicitud_id,
            motivo: solicitud.motivo,
            estado: solicitud.estado,
            fecha: new Date(solicitud.fecha),
            observacion: solicitud.observacion,
            tipo_consulta: "medica",
            examenes: examenes,
            paciente_id: consulta.paciente_id,
            medico_id: consulta.odontologo_id,
            consulta_id: consulta.id,
          });
        }
      } catch (error) {
        console.error("Error al obtener odontodiagrama:", error);
      }
      return consulta;
    } catch (error) {
      console.error("Error al obtener consulta:", error);
      return null;
    }
  }

  public async agregarConsulta(consulta: any) {
    if (this._useMemory) {
      const newId =
        this._memoryConsultas.length > 0
          ? Math.max(...this._memoryConsultas.map((c) => c.id)) + 1
          : 1;

      const nuevaConsulta = {
        ...consulta,
        id: newId,
        fecha: new Date().toISOString().split("T")[0],
      };

      this._memoryConsultas.push(nuevaConsulta);

      // Obtener datos del paciente y odontólogo para el retorno
      const paciente = this._memoryPacientes.find(
        (p) => p.id === consulta.paciente_id
      );
      const odontologo = this._memoryOdontologos.find(
        (o) => o.id === consulta.odontologo_id
      );

      return {
        ...nuevaConsulta,
        paciente: paciente
          ? `${paciente.nombre} ${paciente.apellido}`
          : "Desconocido",
        odontologo: odontologo
          ? `${odontologo.nombre} ${odontologo.apellido}`
          : "No asignado",
      };
    }

    try {
      // Primero crear un historial odontológico
      const [historialResult] = await this._pool.query(
        `
        INSERT INTO historiales_odontologicos (
          paciente_id, 
          descripcion, 
          fecha
        ) VALUES (?, ?, NOW())
      `,
        [consulta.paciente_id, consulta.motivo]
      );

      const historialId = historialResult.insertId;

      // Luego crear la consulta odontológica
      const [consultaResult] = await this._pool.query(
        `
        INSERT INTO consultas_odontologicas (
          paciente_id, 
          odontologo_id, 
          fecha_consulta, 
          historial_id, 
          motivo
        ) VALUES (?, ?, NOW(), ?, ?)
      `,
        [
          consulta.paciente_id,
          consulta.odontologo_id,
          historialId,
          consulta.motivo,
        ]
      );

      const consultaId = consultaResult.insertId;

      // Crear el odontodiagrama
      const [odontodiagramaResult] = await this._pool.query(
        `
        INSERT INTO odontodiagrama (
          paciente_id, 
          fecha_creacion, 
          historial_id
        ) VALUES (?, NOW(), ?)
      `,
        [consulta.paciente_id, historialId]
      );

      const odontodiagramaId = odontodiagramaResult.insertId;

      // Guardar los sectores, dientes y segmentos del odontodiagrama
      const odontodiagrama = consulta.odontodiagrama;

      for (const sectorKey in odontodiagrama) {
        // Insertar sector
        const [sectorResult] = await this._pool.query(
          `
          INSERT INTO sectores (
            odontodiagrama_id, 
            nombre_sector
          ) VALUES (?, ?)
        `,
          [odontodiagramaId, `Sector ${sectorKey}`]
        );

        const sectorId = sectorResult.insertId;
        const dientes = odontodiagrama[sectorKey].dientes;

        // Insertar dientes y segmentos
        for (const dienteKey in dientes) {
          const [dienteResult] = await this._pool.query(
            `
            INSERT INTO dientes (
              sector_id, 
              numero_diente
            ) VALUES (?, ?)
          `,
            [sectorId, dienteKey]
          );

          const dienteId = dienteResult.insertId;
          const segmentos = dientes[dienteKey].segmentos;

          // Insertar segmentos
          for (const segmentoKey in segmentos) {
            await this._pool.query(
              `
              INSERT INTO segmentos (
                diente_id, 
                numero_segmento, 
                valor_afectacion
              ) VALUES (?, ?, ?)
            `,
              [dienteId, segmentoKey, segmentos[segmentoKey]]
            );
          }
        }
      }

      // Obtener los datos del paciente y odontólogo para el retorno
      const [pacientes] = await this._pool.query(
        `
        SELECT nombre, apellido FROM pacientes WHERE paciente_id = ?
      `,
        [consulta.paciente_id]
      );

      const [odontologos] = await this._pool.query(
        `
        SELECT nombre, apellido FROM empleados WHERE empleado_id = ?
      `,
        [consulta.odontologo_id]
      );

      const paciente = pacientes[0];
      const odontologo = odontologos[0];

      return {
        id: consultaId,
        paciente_id: consulta.paciente_id,
        paciente: `${paciente.nombre} ${paciente.apellido}`,
        odontologo_id: consulta.odontologo_id,
        odontologo: `${odontologo.nombre} ${odontologo.apellido}`,
        fecha: new Date().toISOString().split("T")[0],
        motivo: consulta.motivo,
      };
    } catch (error) {
      console.error("Error al agregar consulta:", error);
      throw error;
    }
  }

  public async actualizarConsulta(id: number, consulta: any) {
    if (this._useMemory) {
      const index = this._memoryConsultas.findIndex((c) => c.id === id);
      if (index === -1) return null;

      this._memoryConsultas[index] = {
        ...this._memoryConsultas[index],
        ...consulta,
      };

      // Obtener datos del paciente y odontólogo para el retorno
      const paciente = this._memoryPacientes.find(
        (p) => p.id === this._memoryConsultas[index].paciente_id
      );
      const odontologo = this._memoryOdontologos.find(
        (o) => o.id === this._memoryConsultas[index].odontologo_id
      );

      return {
        ...this._memoryConsultas[index],
        paciente: paciente
          ? `${paciente.nombre} ${paciente.apellido}`
          : "Desconocido",
        odontologo: odontologo
          ? `${odontologo.nombre} ${odontologo.apellido}`
          : "No asignado",
      };
    }

    try {
      // Actualizar la consulta
      const [result] = await this._pool.query(
        `
        UPDATE consultas_odontologicas
        SET 
          odontologo_id = ?,
          motivo = ?
        WHERE consulta_id = ?
      `,
        [consulta.odontologo_id, consulta.motivo, id]
      );

      if (result.affectedRows === 0) return null;

      // Actualizar el historial odontológico
      await this._pool.query(
        `
        UPDATE historiales_odontologicos
        SET 
          descripcion = ?
        WHERE historial_id = (
          SELECT historial_id FROM consultas_odontologicas WHERE consulta_id = ?
        )
      `,
        [consulta.motivo, id]
      );

      // Si se proporciona un odontodiagrama actualizado, actualizarlo
      if (consulta.odontodiagrama) {
        // Obtener el ID del odontodiagrama
        const [odontodiagramaRows] = await this._pool.query(
          `
          SELECT o.odontodiagrama_id
          FROM odontodiagrama o
          JOIN consultas_odontologicas co ON o.historial_id = co.historial_id
          WHERE co.consulta_id = ?
          `,
          [id]
        );

        if (odontodiagramaRows.length > 0) {
          const odontodiagramaId = odontodiagramaRows[0].odontodiagrama_id;
          const odontodiagrama = consulta.odontodiagrama;

          // Para cada sector en el odontodiagrama
          for (const sectorKey in odontodiagrama) {
            // Obtener el ID del sector
            const [sectorRows] = await this._pool.query(
              `
              SELECT sector_id
              FROM sectores
              WHERE odontodiagrama_id = ? AND nombre_sector = ?
              `,
              [odontodiagramaId, `Sector ${sectorKey}`]
            );

            if (sectorRows.length > 0) {
              const sectorId = sectorRows[0].sector_id;
              const dientes = odontodiagrama[sectorKey].dientes;

              // Para cada diente en el sector
              for (const dienteKey in dientes) {
                // Obtener el ID del diente
                const [dienteRows] = await this._pool.query(
                  `
                  SELECT diente_id
                  FROM dientes
                  WHERE sector_id = ? AND numero_diente = ?
                  `,
                  [sectorId, dienteKey]
                );

                if (dienteRows.length > 0) {
                  const dienteId = dienteRows[0].diente_id;
                  const segmentos = dientes[dienteKey].segmentos;

                  // Para cada segmento en el diente
                  for (const segmentoKey in segmentos) {
                    // Actualizar el valor del segmento
                    await this._pool.query(
                      `
                      UPDATE segmentos
                      SET valor_afectacion = ?
                      WHERE diente_id = ? AND numero_segmento = ?
                      `,
                      [segmentos[segmentoKey], dienteId, segmentoKey]
                    );
                  }
                }
              }
            }
          }
        }
      }
      // Si se proporciona solicitudes, actualizar o crear
      if (consulta.solicitudes) {
        for (const solicitud of consulta.solicitudes) {
          // Verificar si la solicitud ya existe
          const [solicitudRows] = await this._pool.query(
            `
            SELECT solicitud_id
            FROM solicitudes_lab_odontologicas
            WHERE consulta_id = ?
          `,
            [id]
          );

          if (solicitudRows.length > 0) {
            // Actualizar la solicitud existente
            await this._pool.query(
              `
              UPDATE solicitudes_laboratorio
              SET 
                motivo = ?, 
                estado = ?, 
                fecha = NOW(), 
                observacion = ?
              WHERE solicitud_id = ?
            `,
              [
                solicitud.motivo,
                solicitud.estado,
                solicitud.observacion,
                solicitudRows[0].solicitud_id,
              ]
            );
          } else {
            // Crear una nueva solicitud
            const [solicitudResult] = await this._pool.query(
              `
              INSERT INTO solicitudes_laboratorio (
                motivo, 
                estado, 
                fecha, 
                observacion
              ) VALUES (?, ?, NOW(), ?)
            `,
              [solicitud.motivo, solicitud.estado, solicitud.observacion]
            );

            const nuevaSolicitudId = solicitudResult.insertId;
            solicitud.solicitud_id = nuevaSolicitudId;

            // Insertar en la tabla de solicitudes lab odontológicas
            await this._pool.query(
              `
              INSERT INTO solicitudes_lab_odontologicas (
                consulta_id, 
                solicitud_id
              ) VALUES (?, ?)
            `,
              [id, nuevaSolicitudId]
            );
          }
          // Si se proporcionan examenes, insertarlos o actualizarlos
          if (solicitud.examenes) {
            for (const examen of solicitud.examenes) {
              // Verificar si el examen ya existe
              const [examenRows] = await this._pool.query(
                `
                SELECT examen_id
                FROM examenes
                WHERE solicitud_id = ? AND tipo_prueba_id = ?
              `,
                [solicitud.solicitud_id, examen.tipo_prueba_id]
              );

              if (examenRows.length > 0) {
                // Actualizar el examen existente
                await this._pool.query(
                  `
                  UPDATE examenes
                  SET 
                    fecha = NOW(), 
                    path_resultados = ?
                  WHERE examen_id = ?
                `,
                  [examen.path_resultados, examenRows[0].examen_id]
                );
              } else {
                // Crear un nuevo examen
                await this._pool.query(
                  `
                  INSERT INTO examenes (
                    solicitud_id, 
                    tipo_prueba_id, 
                    fecha, 
                    path_resultados
                  ) VALUES (?, ?, NOW(), ?)
                `,
                  [
                    solicitud.solicitud_id,
                    examen.tipo_prueba_id,
                    examen.path_resultados,
                  ]
                );
              }
            }
          }
        }
      }

      // Obtener la consulta actualizada
      const [rows] = await this._pool.query(
        `
        SELECT 
          co.consulta_id as id, 
          co.paciente_id,
          co.odontologo_id, 
          co.fecha_consulta as fecha, 
          co.motivo, 
          CONCAT(e.nombre, ' ', e.apellido) as odontologo,
          CONCAT(p.nombre, ' ', p.apellido) as paciente
        FROM consultas_odontologicas co
        JOIN pacientes p ON co.paciente_id = p.paciente_id
        LEFT JOIN empleados e ON co.odontologo_id = e.empleado_id
        WHERE co.consulta_id = ?
      `,
        [id]
      );

      return rows[0];
    } catch (error) {
      console.error("Error al actualizar consulta:", error);
      throw error;
    }
  }

  public async eliminarConsulta(id: number) {
    if (this._useMemory) {
      const index = this._memoryConsultas.findIndex((c) => c.id === id);
      if (index === -1) return false;

      this._memoryConsultas.splice(index, 1);
      return true;
    }

    try {
      // Primero obtener el historial_id asociado a la consulta
      const [consultaRows] = await this._pool.query(
        `
        SELECT historial_id
        FROM consultas_odontologicas
        WHERE consulta_id = ?
      `,
        [id]
      );

      if (consultaRows.length === 0) return false;

      const historialId = consultaRows[0].historial_id;

      // Obtener el odontodiagrama_id asociado al historial
      const [odontodiagramaRows] = await this._pool.query(
        `
        SELECT odontodiagrama_id
        FROM odontodiagrama
        WHERE historial_id = ?
      `,
        [historialId]
      );

      if (odontodiagramaRows.length > 0) {
        const odontodiagramaId = odontodiagramaRows[0].odontodiagrama_id;

        // Obtener los sectores asociados al odontodiagrama
        const [sectoresRows] = await this._pool.query(
          `
          SELECT sector_id
          FROM sectores
          WHERE odontodiagrama_id = ?
        `,
          [odontodiagramaId]
        );

        // Para cada sector, eliminar sus dientes y segmentos
        for (const sector of sectoresRows) {
          const sectorId = sector.sector_id;

          // Obtener los dientes asociados al sector
          const [dientesRows] = await this._pool.query(
            `
            SELECT diente_id
            FROM dientes
            WHERE sector_id = ?
          `,
            [sectorId]
          );

          // Para cada diente, eliminar sus segmentos
          for (const diente of dientesRows) {
            const dienteId = diente.diente_id;

            // Eliminar los segmentos
            await this._pool.query(
              `
              DELETE FROM segmentos
              WHERE diente_id = ?
            `,
              [dienteId]
            );
          }

          // Eliminar los dientes
          await this._pool.query(
            `
            DELETE FROM dientes
            WHERE sector_id = ?
          `,
            [sectorId]
          );
        }

        // Eliminar los sectores
        await this._pool.query(
          `
          DELETE FROM sectores
          WHERE odontodiagrama_id = ?
        `,
          [odontodiagramaId]
        );

        // Eliminar el odontodiagrama
        await this._pool.query(
          `
          DELETE FROM odontodiagrama
          WHERE odontodiagrama_id = ?
        `,
          [odontodiagramaId]
        );
      }

      // Eliminar la consulta
      await this._pool.query(
        `
        DELETE FROM consultas_odontologicas
        WHERE consulta_id = ?
      `,
        [id]
      );

      // Eliminar el historial
      await this._pool.query(
        `
        DELETE FROM historiales_odontologicos
        WHERE historial_id = ?
      `,
        [historialId]
      );

      return true;
    } catch (error) {
      console.error("Error al eliminar consulta:", error);
      throw error;
    }
  }

  public async getTipoPruebas() {
    try {
      const [rows] = await this._pool.query(`
        SELECT tipo_id, nombre 
        FROM tipo_prueba
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching test types:", error);
      throw error;
    }
  }
  public async getLaboratorios() {}
  public async crearLaboratorio(solicitud: any, examenes: any[]) {
    if (this._useMemory) {
      const newId =
        this._memoryConsultas.length > 0
          ? Math.max(...this._memoryConsultas.map((c) => c.id)) + 1
          : 1;

      const nuevaSolicitud = {
        ...solicitud,
        solicitud_id: newId,
      };

      this._memoryConsultas.push(nuevaSolicitud);

      // Save exams in memory
      for (const examen of examenes) {
        this._memoryConsultas.push({
          solicitud_id: newId,
          tipo_prueba_id: examen.tipo_prueba_id,
          fecha: examen.fecha,
        });
      }

      return nuevaSolicitud;
    }

    try {
      // Save the laboratory request
      const [result] = await this._pool.query(
        `
        INSERT INTO solicitudes_laboratorio (
          paciente_id, 
          medico_id, 
          motivo, 
          estado, 
          fecha, 
          observacion
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          solicitud.paciente_id,
          solicitud.medico_id,
          solicitud.motivo,
          solicitud.estado,
          solicitud.fecha,
          solicitud.observacion,
        ]
      );

      const solicitudId = result.insertId;
      await this._pool.query(
        `INSERT INTO
          solicitudes_lab_odontologicas (
            solicitud_id,
            consulta_id
          )
	        VALUES (
            ?,
            ?
          )
      `,
        [solicitudId, solicitud.consulta_id]
      );
      // Save associated exams
      for (const examen of examenes) {
        await this._pool.query(
          `
          INSERT INTO examenes (
            solicitud_id, 
            tipo_prueba_id, 
            fecha
          ) VALUES (?, ?, ?)
        `,
          [
            solicitudId,
            examen.tipo_prueba_id,
            new Date().toISOString().slice(0, 19).replace("T", " "),
          ]
        );
      }

      return { solicitud_id: solicitudId, ...solicitud };
    } catch (error) {
      console.error("Error al crear laboratorio:", error);
      throw error;
    }
  }
}

// Método para probar la conexión a la base de datos

// Exportar una función para obtener la instancia de la base de datos
// export async function getDatabase() {
//   return await Database.getInstance()
// }

// Para compatibilidad con el código existente, exportamos una versión simulada
// que se reemplazará con la real cuando se inicialice
// export const db = {
//   getPacientes: async () => [],
//   getPacientePorId: async () => null,
//   getPacientesPorNombre: async () => [],
//   agregarPaciente: async (p: any) => p,
//   getConsultas: async () => [],
//   getConsultaPorId: async () => null,
//   agregarConsulta: async (c: any) => c,
//   actualizarConsulta: async () => null,
//   eliminarConsulta: async () => false,
//   getOdontologos: async () => [],
//   getOdontologoPorId: async () => null,
//   agregarOdontologo: async (o: any) => o,
//   actualizarOdontologo: async () => null,
//   eliminarOdontologo: async () => false,
//   testConnection: async () => ({ connected: false, message: "No inicializado" }),
//   isUsingMemory: () => true,
// }

// Inicializar la base de datos real
// ;(async () => {
//   const database = await Database.getInstance()
//   // Reemplazar los métodos simulados con los reales
//   Object.assign(db, {
//     getPacientes: async () => await database.getPacientes(),
//     getPacientePorId: async (id: number) => await database.getPacientePorId(id),
//     getPacientesPorNombre: async (query: string) => await database.getPacientesPorNombre(query),
//     agregarPaciente: async (p: any) => await database.agregarPaciente(p),
//     getConsultas: async () => await database.getConsultas(),
//     getConsultaPorId: async (id: number) => await database.getConsultaPorId(id),
//     agregarConsulta: async (c: any) => await database.agregarConsulta(c),
//     actualizarConsulta: async (id: number, c: any) => await database.actualizarConsulta(id, c),
//     eliminarConsulta: async (id: number) => await database.eliminarConsulta(id),
//     getOdontologos: async () => await database.getOdontologos(),
//     getOdontologoPorId: async (id: number) => await database.getOdontologoPorId(id),
//     agregarOdontologo: async (o: any) => await database.agregarOdontologo(o),
//     actualizarOdontologo: async (id: number, o: any) => await database.actualizarOdontologo(id, o),
//     eliminarOdontologo: async (id: number) => await database.eliminarOdontologo(id),
//     testConnection: async () => await database.testConnection(),
//     isUsingMemory: () => database.isUsingMemory(),
//   })
// })()

// Exportar una instancia única de la base de datos
export const db = new Database();
