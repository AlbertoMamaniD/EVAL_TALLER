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
  titulo?: unknown;
  descripcion?: unknown;
  proyectoId?: unknown;
  prioridad?: unknown;
  estado?: unknown;
  fechaVencimiento?: unknown;
};

export type TareaInput = {
  titulo: string;
  descripcion: string;
  proyectoId: string;
  prioridad: TareaPrioridad;
  estado: TareaEstado;
  fechaVencimiento: string | null;
};

export type TareaValidationErrors = Partial<
  Record<
    "titulo" | "descripcion" | "proyectoId" | "prioridad" | "estado" | "fechaVencimiento",
    string
  >
>;
