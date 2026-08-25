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

function createEmptyResumen() {
  return {
    totalTareas: 0,
    tareasPendientes: 0,
    tareasEnProgreso: 0,
    tareasHechas: 0
  };
}

function getDashboardResumen(): DashboardResumenProyecto[] {
  const proyectos = listProyectos();
  const tareas = listTareas();
  const resumenPorProyecto = new Map<string, ReturnType<typeof createEmptyResumen>>();

  for (const tarea of tareas) {
    const resumenActual =
      resumenPorProyecto.get(tarea.proyectoId) ?? createEmptyResumen();

    resumenActual.totalTareas += 1;

    if (tarea.estado === "pendiente") {
      resumenActual.tareasPendientes += 1;
    }

    if (tarea.estado === "en_progreso") {
      resumenActual.tareasEnProgreso += 1;
    }

    if (tarea.estado === "hecha") {
      resumenActual.tareasHechas += 1;
    }

    resumenPorProyecto.set(tarea.proyectoId, resumenActual);
  }

  return proyectos.map((proyecto) => {
    const resumenProyecto = resumenPorProyecto.get(proyecto.id) ?? createEmptyResumen();

    return {
      proyectoId: proyecto.id,
      nombreProyecto: proyecto.nombre,
      totalTareas: resumenProyecto.totalTareas,
      tareasPendientes: resumenProyecto.tareasPendientes,
      tareasEnProgreso: resumenProyecto.tareasEnProgreso,
      tareasHechas: resumenProyecto.tareasHechas
    };
  });
}

export { getDashboardResumen };
