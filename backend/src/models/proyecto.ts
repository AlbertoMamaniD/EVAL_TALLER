export type ProyectoEstado = "activo" | "cerrado";

export type Proyecto = {
  id: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string | null;
  estado: ProyectoEstado;
};

export type ProyectoPayload = {
  nombre?: unknown;
  descripcion?: unknown;
  fechaLimite?: unknown;
  estado?: unknown;
};

export type ProyectoInput = {
  nombre: string;
  descripcion: string;
  fechaLimite: string | null;
  estado: ProyectoEstado;
};

export type ProyectoValidationErrors = Partial<
  Record<"nombre" | "descripcion" | "fechaLimite" | "estado", string>
>;
