import { useEffect, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { getDashboardResumen, type DashboardResumenProyecto } from "../services/dashboardApi";
import { ApiError } from "../services/apiClient";

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function DashboardPage() {
  const [resumen, setResumen] = useState<DashboardResumenProyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadResumen = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDashboardResumen();

        if (!isActive) {
          return;
        }

        setResumen(response);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(getErrorMessage(loadError, "No se pudo cargar el dashboard."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadResumen();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <PageLayout
      bodyClassName="summary-grid"
      description="Visualiza el avance de cada proyecto según el total de tareas y su distribucion por estado."
      eyebrow="Dashboard"
      feedback={error ? <div className="feedback-banner feedback-error">{error}</div> : undefined}
      title="Resumen por proyecto"
    >
        {isLoading && <p className="muted">Cargando resumen...</p>}

        {!isLoading && resumen.length === 0 && (
          <section className="panel">
            <p className="muted">Todavia no hay proyectos con tareas para resumir.</p>
          </section>
        )}

        {!isLoading &&
          resumen.map((item) => (
            <article key={item.proyectoId} className="panel summary-card">
              <div className="panel-heading">
                <p className="eyebrow">Proyecto</p>
                <h2>{item.nombreProyecto}</h2>
              </div>

              <div className="summary-total">
                <span className="summary-total-label">Total de tareas</span>
                <strong>{item.totalTareas}</strong>
              </div>

              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="badge badge-estado-pendiente">Pendientes</span>
                  <strong>{item.tareasPendientes}</strong>
                </div>
                <div className="summary-stat">
                  <span className="badge badge-estado-en_progreso">En progreso</span>
                  <strong>{item.tareasEnProgreso}</strong>
                </div>
                <div className="summary-stat">
                  <span className="badge badge-estado-hecha">Hechas</span>
                  <strong>{item.tareasHechas}</strong>
                </div>
              </div>
            </article>
          ))}
    </PageLayout>
  );
}

export default DashboardPage;
