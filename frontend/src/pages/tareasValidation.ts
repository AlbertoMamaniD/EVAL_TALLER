import { isValidDateString } from "../services/dateValidation";
import type {
  TareaEstado,
  TareaPayload,
  TareaPrioridad,
  TareaValidationErrors
} from "../services/tareasApi";

export type TareaFormValues = {
  titulo: string;
  descripcion: string;
  proyectoId: string;
  prioridad: TareaPrioridad;
  estado: TareaEstado;
  fechaVencimiento: string;
};

const MAX_TAREA_TITULO_LENGTH = 120;
const MAX_TAREA_DESCRIPCION_LENGTH = 500;

function validateTareaForm(
  values: TareaFormValues,
  availableProjectIds: string[]
): TareaValidationErrors {
  const errors: TareaValidationErrors = {};

  if (!values.titulo.trim()) {
    errors.titulo = "El titulo es obligatorio.";
  } else if (values.titulo.trim().length > MAX_TAREA_TITULO_LENGTH) {
    errors.titulo = `El titulo no puede superar los ${MAX_TAREA_TITULO_LENGTH} caracteres.`;
  }

  if (values.descripcion.trim().length > MAX_TAREA_DESCRIPCION_LENGTH) {
    errors.descripcion =
      `La descripcion no puede superar los ${MAX_TAREA_DESCRIPCION_LENGTH} caracteres.`;
  }

  if (!values.proyectoId.trim()) {
    errors.proyectoId = "El proyecto es obligatorio.";
  } else if (!availableProjectIds.includes(values.proyectoId)) {
    errors.proyectoId = "El proyecto seleccionado no existe.";
  }

  if (values.fechaVencimiento && !isValidDateString(values.fechaVencimiento)) {
    errors.fechaVencimiento = "La fecha de vencimiento debe ser una fecha valida.";
  }

  return errors;
}

function toTareaPayload(values: TareaFormValues): TareaPayload {
  return {
    titulo: values.titulo.trim(),
    descripcion: values.descripcion.trim(),
    proyectoId: values.proyectoId.trim(),
    prioridad: values.prioridad,
    estado: values.estado,
    fechaVencimiento: values.fechaVencimiento ? values.fechaVencimiento : null
  };
}

function createEmptyTareaFormValues(): TareaFormValues {
  return {
    titulo: "",
    descripcion: "",
    proyectoId: "",
    prioridad: "media",
    estado: "pendiente",
    fechaVencimiento: ""
  };
}

export { createEmptyTareaFormValues, toTareaPayload, validateTareaForm };
