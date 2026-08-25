type ApiErrorPayload<TErrors> = {
  message?: string;
  errors?: TErrors;
};

class ApiError<TErrors = Record<string, string>> extends Error {
  status: number;
  errors?: TErrors;

  constructor(message: string, status: number, errors?: TErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function requestJson<TResponse, TErrors = Record<string, string>>(
  basePath: string,
  path = "",
  options?: RequestInit
): Promise<TResponse> {
  const response = await fetch(`${basePath}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    let payload: ApiErrorPayload<TErrors> | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload<TErrors>;
    } catch {
      payload = null;
    }

    throw new ApiError<TErrors>(
      payload?.message || "Ocurrio un error al comunicarse con la API.",
      response.status,
      payload?.errors
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export { ApiError, requestJson };
