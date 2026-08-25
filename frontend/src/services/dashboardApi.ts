import { requestJson } from "./apiClient";

export type DashboardResumenProyecto = {
  proyectoId: string;
  nombreProyecto: string;
  totalTareas: number;
  tareasPendientes: number;
  tareasEnProgreso: number;
  tareasHechas: number;
};

function getDashboardResumen(): Promise<DashboardResumenProyecto[]> {
  return requestJson<DashboardResumenProyecto[]>("/api/dashboard/resumen");
}

export { getDashboardResumen };
