import type {
  Tarea,
  TareaEstado,
  TareaInput,
  TareaPayload,
  TareaPrioridad,
  TareaValidationErrors
} from "../models/tarea.js";
import { getProyectoById } from "../store/proyectoStore.js";
import {
  createTarea as createTareaInStore,
  deleteTarea as deleteTareaInStore,
  getTareaById,
  listTareas as listTareasInStore,
  updateTarea as updateTareaInStore
} from "../store/tareaStore.js";
import { isValidDateString } from "./dateValidation.js";

type ValidationResult =
  | {
      success: true;
      data: TareaInput;
    }
  | {
      success: false;
      errors: TareaValidationErrors;
    };

type MutateTareaResult =
  | {
      success: true;
      data: Tarea;
    }
  | {
      success: false;
      errors: TareaValidationErrors;
    };

const PRIORIDADES_TAREA: TareaPrioridad[] = ["baja", "media", "alta"];
const ESTADOS_TAREA: TareaEstado[] = ["pendiente", "en_progreso", "hecha"];

type ListTareasFilters = {
  estado?: string;
  prioridad?: string;
  proyectoId?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidTareaPrioridad(value: unknown): value is TareaPrioridad {
  return typeof value === "string" && PRIORIDADES_TAREA.includes(value as TareaPrioridad);
}

function isValidTareaEstado(value: unknown): value is TareaEstado {
  return typeof value === "string" && ESTADOS_TAREA.includes(value as TareaEstado);
}

function isValidListTareasFilters(filters: ListTareasFilters): boolean {
  if (filters.estado && !isValidTareaEstado(filters.estado)) {
    return false;
  }

  if (filters.prioridad && !isValidTareaPrioridad(filters.prioridad)) {
    return false;
  }

  return true;
}

function validateTareaPayload(
  payload: unknown,
  defaultPrioridad: TareaPrioridad = "media",
  defaultEstado: TareaEstado = "pendiente"
): ValidationResult {
  if (!isObject(payload)) {
    return {
      success: false,
      errors: {
        titulo: "El titulo es obligatorio.",
        proyectoId: "El proyecto es obligatorio."
      }
    };
  }

  const tareaPayload = payload as TareaPayload;
  const errors: TareaValidationErrors = {};
  const titulo = typeof tareaPayload.titulo === "string" ? tareaPayload.titulo.trim() : "";
  const proyectoId =
    typeof tareaPayload.proyectoId === "string" ? tareaPayload.proyectoId.trim() : "";

  if (!titulo) {
    errors.titulo = "El titulo es obligatorio.";
  }

  if (
    tareaPayload.descripcion !== undefined &&
    typeof tareaPayload.descripcion !== "string"
  ) {
    errors.descripcion = "La descripcion debe ser un texto.";
  }

  if (!proyectoId) {
    errors.proyectoId = "El proyecto es obligatorio.";
  } else if (!getProyectoById(proyectoId)) {
    errors.proyectoId = "El proyecto seleccionado no existe.";
  }

  if (
    tareaPayload.prioridad !== undefined &&
    !isValidTareaPrioridad(tareaPayload.prioridad)
  ) {
    errors.prioridad = "La prioridad debe ser 'baja', 'media' o 'alta'.";
  }

  if (tareaPayload.estado !== undefined && !isValidTareaEstado(tareaPayload.estado)) {
    errors.estado = "El estado debe ser 'pendiente', 'en_progreso' o 'hecha'.";
  }

  if (
    tareaPayload.fechaVencimiento !== undefined &&
    tareaPayload.fechaVencimiento !== null
  ) {
    const fechaVencimiento =
      typeof tareaPayload.fechaVencimiento === "string"
        ? tareaPayload.fechaVencimiento.trim()
        : tareaPayload.fechaVencimiento;

    if (
      typeof fechaVencimiento !== "string" ||
      fechaVencimiento === "" ||
      !isValidDateString(fechaVencimiento)
    ) {
      errors.fechaVencimiento = "La fecha de vencimiento debe ser una fecha valida.";
    }
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
      titulo,
      descripcion:
        typeof tareaPayload.descripcion === "string"
          ? tareaPayload.descripcion.trim()
          : "",
      proyectoId,
      prioridad: isValidTareaPrioridad(tareaPayload.prioridad)
        ? tareaPayload.prioridad
        : defaultPrioridad,
      estado: isValidTareaEstado(tareaPayload.estado)
        ? tareaPayload.estado
        : defaultEstado,
      fechaVencimiento:
        typeof tareaPayload.fechaVencimiento === "string"
          ? tareaPayload.fechaVencimiento.trim()
          : null
    }
  };
}

function listTareas(filters?: ListTareasFilters): Tarea[] {
  if (!filters) {
    return listTareasInStore();
  }

  if (!isValidListTareasFilters(filters)) {
    return [];
  }

  return listTareasInStore({
    proyectoId: filters.proyectoId,
    estado: filters.estado as TareaEstado | undefined,
    prioridad: filters.prioridad as TareaPrioridad | undefined
  });
}

function findTareaById(id: string): Tarea | undefined {
  return getTareaById(id);
}

function createTarea(payload: unknown): MutateTareaResult {
  const validationResult = validateTareaPayload(payload, "media", "pendiente");

  if (!validationResult.success) {
    return validationResult;
  }

  return {
    success: true,
    data: createTareaInStore(validationResult.data)
  };
}

function updateTarea(id: string, payload: unknown): MutateTareaResult | null {
  const existingTarea = getTareaById(id);

  if (!existingTarea) {
    return null;
  }

  const validationResult = validateTareaPayload(
    payload,
    existingTarea.prioridad,
    existingTarea.estado
  );

  if (!validationResult.success) {
    return validationResult;
  }

  return {
    success: true,
    data: updateTareaInStore(id, validationResult.data) as Tarea
  };
}

function deleteTarea(id: string): boolean {
  return deleteTareaInStore(id);
}

export {
  createTarea,
  deleteTarea,
  findTareaById,
  listTareas,
  updateTarea,
  validateTareaPayload
};
