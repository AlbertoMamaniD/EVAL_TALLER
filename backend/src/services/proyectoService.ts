import type {
  Proyecto,
  ProyectoEstado,
  ProyectoInput,
  ProyectoPayload,
  ProyectoValidationErrors
} from "../models/proyecto.js";
import {
  createProyecto as createProyectoInStore,
  deleteProyecto as deleteProyectoInStore,
  getProyectoById,
  listProyectos as listProyectosInStore,
  updateProyecto as updateProyectoInStore
} from "../store/proyectoStore.js";

type ValidationResult =
  | {
      success: true;
      data: ProyectoInput;
    }
  | {
      success: false;
      errors: ProyectoValidationErrors;
    };

type MutateProyectoResult =
  | {
      success: true;
      data: Proyecto;
    }
  | {
      success: false;
      errors: ProyectoValidationErrors;
    };

const ESTADOS_PROYECTO: ProyectoEstado[] = ["activo", "cerrado"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidProyectoEstado(value: unknown): value is ProyectoEstado {
  return typeof value === "string" && ESTADOS_PROYECTO.includes(value as ProyectoEstado);
}

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateProyectoPayload(
  payload: unknown,
  defaultEstado: ProyectoEstado = "activo"
): ValidationResult {
  if (!isObject(payload)) {
    return {
      success: false,
      errors: {
        nombre: "El nombre es obligatorio."
      }
    };
  }

  const proyectoPayload = payload as ProyectoPayload;
  const errors: ProyectoValidationErrors = {};
  const nombre =
    typeof proyectoPayload.nombre === "string" ? proyectoPayload.nombre.trim() : "";

  if (!nombre) {
    errors.nombre = "El nombre es obligatorio.";
  }

  if (
    proyectoPayload.descripcion !== undefined &&
    typeof proyectoPayload.descripcion !== "string"
  ) {
    errors.descripcion = "La descripcion debe ser un texto.";
  }

  if (proyectoPayload.fechaLimite !== undefined && proyectoPayload.fechaLimite !== null) {
    const fechaLimite =
      typeof proyectoPayload.fechaLimite === "string"
        ? proyectoPayload.fechaLimite.trim()
        : proyectoPayload.fechaLimite;

    if (
      typeof fechaLimite !== "string" ||
      fechaLimite === "" ||
      !isValidDate(fechaLimite)
    ) {
      errors.fechaLimite = "La fecha limite debe ser una fecha valida.";
    }
  }

  if (
    proyectoPayload.estado !== undefined &&
    !isValidProyectoEstado(proyectoPayload.estado)
  ) {
    errors.estado = "El estado debe ser 'activo' o 'cerrado'.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors
    };
  }

  return {
    success: true,
    data: {
      nombre,
      descripcion:
        typeof proyectoPayload.descripcion === "string"
          ? proyectoPayload.descripcion.trim()
          : "",
      fechaLimite:
        typeof proyectoPayload.fechaLimite === "string"
          ? proyectoPayload.fechaLimite.trim()
          : null,
      estado: isValidProyectoEstado(proyectoPayload.estado)
        ? proyectoPayload.estado
        : defaultEstado
    }
  };
}

function listProyectos(): Proyecto[] {
  return listProyectosInStore();
}

function findProyectoById(id: string): Proyecto | undefined {
  return getProyectoById(id);
}

function createProyecto(payload: unknown): MutateProyectoResult {
  const validationResult = validateProyectoPayload(payload, "activo");

  if (!validationResult.success) {
    return validationResult;
  }

  return {
    success: true,
    data: createProyectoInStore(validationResult.data)
  };
}

function updateProyecto(id: string, payload: unknown): MutateProyectoResult | null {
  const existingProyecto = getProyectoById(id);

  if (!existingProyecto) {
    return null;
  }

  const validationResult = validateProyectoPayload(payload, existingProyecto.estado);

  if (!validationResult.success) {
    return validationResult;
  }

  return {
    success: true,
    data: updateProyectoInStore(id, validationResult.data) as Proyecto
  };
}

function deleteProyecto(id: string): boolean {
  return deleteProyectoInStore(id);
}

export {
  createProyecto,
  deleteProyecto,
  findProyectoById,
  listProyectos,
  updateProyecto,
  validateProyectoPayload
};
