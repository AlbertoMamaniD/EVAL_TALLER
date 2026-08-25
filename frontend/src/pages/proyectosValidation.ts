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

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(0, month - 1, day));

  date.setUTCFullYear(year);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateProyectoForm(
  values: ProyectoFormValues
): ProyectoValidationErrors {
  const errors: ProyectoValidationErrors = {};

  if (!values.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio.";
  }

  if (values.fechaLimite && !isValidDate(values.fechaLimite)) {
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
