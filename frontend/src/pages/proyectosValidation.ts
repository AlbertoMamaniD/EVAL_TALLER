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
  return !Number.isNaN(Date.parse(value));
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
