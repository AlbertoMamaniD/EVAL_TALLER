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

function listTareas(proyectoId?: string): Promise<Tarea[]> {
  const query = proyectoId ? `?proyectoId=${encodeURIComponent(proyectoId)}` : "";

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
