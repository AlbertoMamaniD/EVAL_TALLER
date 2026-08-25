import { listProyectos } from "../store/proyectoStore.js";
import { listTareas } from "../store/tareaStore.js";

type DashboardResumenProyecto = {
  proyectoId: string;
  nombreProyecto: string;
  totalTareas: number;
  tareasPendientes: number;
  tareasEnProgreso: number;
  tareasHechas: number;
};

function getDashboardResumen(): DashboardResumenProyecto[] {
  const proyectos = listProyectos();
  const tareas = listTareas();

  return proyectos.map((proyecto) => {
    const tareasDelProyecto = tareas.filter((tarea) => tarea.proyectoId === proyecto.id);

    return {
      proyectoId: proyecto.id,
      nombreProyecto: proyecto.nombre,
      totalTareas: tareasDelProyecto.length,
      tareasPendientes: tareasDelProyecto.filter(
        (tarea) => tarea.estado === "pendiente"
      ).length,
      tareasEnProgreso: tareasDelProyecto.filter(
        (tarea) => tarea.estado === "en_progreso"
      ).length,
      tareasHechas: tareasDelProyecto.filter((tarea) => tarea.estado === "hecha")
        .length
    };
  });
}

export { getDashboardResumen };
