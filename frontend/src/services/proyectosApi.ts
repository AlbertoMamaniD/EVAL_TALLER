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

type ApiErrorPayload = {
  message?: string;
  errors?: ProyectoValidationErrors;
};

class ApiError extends Error {
  status: number;
  errors?: ProyectoValidationErrors;

  constructor(message: string, status: number, errors?: ProyectoValidationErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path = "", options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/proyectos${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    throw new ApiError(
      payload?.message || "Ocurrio un error al comunicarse con la API.",
      response.status,
      payload?.errors
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function listProyectos(): Promise<Proyecto[]> {
  return request<Proyecto[]>();
}

function createProyecto(payload: ProyectoPayload): Promise<Proyecto> {
  return request<Proyecto>("", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function updateProyecto(id: string, payload: ProyectoPayload): Promise<Proyecto> {
  return request<Proyecto>(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

function deleteProyecto(id: string): Promise<void> {
  return request<void>(`/${id}`, {
    method: "DELETE"
  });
}

export { ApiError, createProyecto, deleteProyecto, listProyectos, updateProyecto };
