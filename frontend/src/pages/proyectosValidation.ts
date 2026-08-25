import { isValidDateString } from "../services/dateValidation";
import type {
  ProyectoEstado,
  ProyectoPayload,
  ProyectoValidationErrors
} from "../services/proyectosApi";

export type ProyectoFormValues = {
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  estado: ProyectoEstado;
};

const MAX_PROYECTO_NOMBRE_LENGTH = 100;
const MAX_PROYECTO_DESCRIPCION_LENGTH = 500;

function validateProyectoForm(
  values: ProyectoFormValues
): ProyectoValidationErrors {
  const errors: ProyectoValidationErrors = {};

  if (!values.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio.";
  } else if (values.nombre.trim().length > MAX_PROYECTO_NOMBRE_LENGTH) {
    errors.nombre = `El nombre no puede superar los ${MAX_PROYECTO_NOMBRE_LENGTH} caracteres.`;
  }

  if (values.descripcion.trim().length > MAX_PROYECTO_DESCRIPCION_LENGTH) {
    errors.descripcion =
      `La descripcion no puede superar los ${MAX_PROYECTO_DESCRIPCION_LENGTH} caracteres.`;
  }

  if (values.fechaLimite && !isValidDateString(values.fechaLimite)) {
    errors.fechaLimite = "La fecha limite debe ser una fecha valida.";
  }

  return errors;
}

function toProyectoPayload(values: ProyectoFormValues): ProyectoPayload {
  return {
    nombre: values.nombre.trim(),
    descripcion: values.descripcion.trim(),
    fechaLimite: values.fechaLimite ? values.fechaLimite : null,
    estado: values.estado
  };
}

function createEmptyProyectoFormValues(): ProyectoFormValues {
  return {
    nombre: "",
    descripcion: "",
    fechaLimite: "",
    estado: "activo"
  };
}

export {
  createEmptyProyectoFormValues,
  toProyectoPayload,
  validateProyectoForm
};
