import { ApiError, requestJson } from "./apiClient";

export type TareaPrioridad = "baja" | "media" | "alta";
export type TareaEstado = "pendiente" | "en_progreso" | "hecha";

export type Tarea = {
  id: string;
  titulo: string;
  descripcion: string;
  proyectoId: string;
  prioridad: TareaPrioridad;
  estado: TareaEstado;
  fechaVencimiento: string | null;
};

export type TareaPayload = {
  titulo: string;
  descripcion?: string;
  proyectoId: string;
  prioridad?: TareaPrioridad;
  estado?: TareaEstado;
  fechaVencimiento?: string | null;
};

export type TareaValidationErrors = Partial<
  Record<
    "titulo" | "descripcion" | "proyectoId" | "prioridad" | "estado" | "fechaVencimiento",
    string
  >
>;

type ListTareasFilters = {
  estado?: TareaEstado | "";
  prioridad?: TareaPrioridad | "";
  proyectoId?: string;
};

function listTareas(filters?: ListTareasFilters): Promise<Tarea[]> {
  const params = new URLSearchParams();

  if (filters?.proyectoId) {
    params.set("proyectoId", filters.proyectoId);
  }

  if (filters?.estado) {
    params.set("estado", filters.estado);
  }

  if (filters?.prioridad) {
    params.set("prioridad", filters.prioridad);
  }

  const query = params.size > 0 ? `?${params.toString()}` : "";

  return requestJson<Tarea[], TareaValidationErrors>("/api/tareas", query);
}

function createTarea(payload: TareaPayload): Promise<Tarea> {
  return requestJson<Tarea, TareaValidationErrors>("/api/tareas", "", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function updateTarea(id: string, payload: TareaPayload): Promise<Tarea> {
  return requestJson<Tarea, TareaValidationErrors>("/api/tareas", `/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

function deleteTarea(id: string): Promise<void> {
  return requestJson<void, TareaValidationErrors>("/api/tareas", `/${id}`, {
    method: "DELETE"
  });
}

export { ApiError, createTarea, deleteTarea, listTareas, updateTarea };
