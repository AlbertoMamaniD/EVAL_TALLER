import { ApiError, requestJson } from "./apiClient";

export type ProyectoEstado = "activo" | "cerrado";

export type Proyecto = {
  id: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string | null;
  estado: ProyectoEstado;
};

export type ProyectoPayload = {
  nombre: string;
  descripcion?: string;
  fechaLimite?: string | null;
  estado?: ProyectoEstado;
};

export type ProyectoValidationErrors = Partial<
  Record<"nombre" | "descripcion" | "fechaLimite" | "estado", string>
>;

function listProyectos(): Promise<Proyecto[]> {
  return requestJson<Proyecto[], ProyectoValidationErrors>("/api/proyectos");
}

function createProyecto(payload: ProyectoPayload): Promise<Proyecto> {
  return requestJson<Proyecto, ProyectoValidationErrors>("/api/proyectos", "", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function updateProyecto(id: string, payload: ProyectoPayload): Promise<Proyecto> {
  return requestJson<Proyecto, ProyectoValidationErrors>(
    "/api/proyectos",
    `/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload)
    }
  );
}

function deleteProyecto(id: string): Promise<void> {
  return requestJson<void, ProyectoValidationErrors>("/api/proyectos", `/${id}`, {
    method: "DELETE"
  });
}

export { ApiError, createProyecto, deleteProyecto, listProyectos, updateProyecto };
