import type { Tarea, TareaInput } from "../models/tarea.js";

let tareas: Tarea[] = [];
let nextTareaId = 1;

type ListTareasFilters = {
  estado?: Tarea["estado"];
  prioridad?: Tarea["prioridad"];
  proyectoId?: string;
};

function hasTareasByProyectoId(proyectoId: string): boolean {
  return tareas.some((tarea) => tarea.proyectoId === proyectoId);
}

function listTareas(filters?: ListTareasFilters): Tarea[] {
  const filteredTareas = tareas.filter((tarea) => {
    if (filters?.proyectoId && tarea.proyectoId !== filters.proyectoId) {
      return false;
    }

    if (filters?.estado && tarea.estado !== filters.estado) {
      return false;
    }

    if (filters?.prioridad && tarea.prioridad !== filters.prioridad) {
      return false;
    }

    return true;
  });

  return filteredTareas.map((tarea) => ({ ...tarea }));
}

function getTareaById(id: string): Tarea | undefined {
  const tarea = tareas.find((item) => item.id === id);

  return tarea ? { ...tarea } : undefined;
}

function createTarea(input: TareaInput): Tarea {
  const tarea: Tarea = {
    id: String(nextTareaId),
    ...input
  };

  nextTareaId += 1;
  tareas.push(tarea);

  return { ...tarea };
}

function updateTarea(id: string, input: TareaInput): Tarea | undefined {
  const tareaIndex = tareas.findIndex((item) => item.id === id);

  if (tareaIndex === -1) {
    return undefined;
  }

  const updatedTarea: Tarea = {
    id,
    ...input
  };

  tareas[tareaIndex] = updatedTarea;

  return { ...updatedTarea };
}

function deleteTarea(id: string): boolean {
  const tareaIndex = tareas.findIndex((item) => item.id === id);

  if (tareaIndex === -1) {
    return false;
  }

  tareas.splice(tareaIndex, 1);

  return true;
}

function resetTareaStore(): void {
  tareas = [];
  nextTareaId = 1;
}

export {
  createTarea,
  deleteTarea,
  getTareaById,
  hasTareasByProyectoId,
  listTareas,
  resetTareaStore,
  updateTarea
};
