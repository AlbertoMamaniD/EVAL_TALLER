import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error("No se pudo consultar el backend.");
        }

        const data = (await response.json()) as HealthResponse;
        setHealth(data);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Ocurrio un error inesperado.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadHealth();
  }, []);

  return (
    <main className="app-shell">
      <section className="status-card">
        <p className="eyebrow">Conexion frontend-backend</p>
        <h1>Gestor de Tareas por Proyecto</h1>
        {isLoading && <p>Consultando estado del backend...</p>}
        {error && <p className="error">{error}</p>}
        {health && <p className="success">Backend disponible: {health.status}</p>}
      </section>
    </main>
  );
}

export default App;
