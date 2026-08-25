import type { Proyecto, ProyectoInput } from "../models/proyecto.js";

let proyectos: Proyecto[] = [];
let nextProyectoId = 1;

function listProyectos(): Proyecto[] {
  return proyectos.map((proyecto) => ({ ...proyecto }));
}

function getProyectoById(id: string): Proyecto | undefined {
  const proyecto = proyectos.find((item) => item.id === id);

  return proyecto ? { ...proyecto } : undefined;
}

function createProyecto(input: ProyectoInput): Proyecto {
  const proyecto: Proyecto = {
    id: String(nextProyectoId),
    ...input
  };

  nextProyectoId += 1;
  proyectos.push(proyecto);

  return { ...proyecto };
}

function updateProyecto(id: string, input: ProyectoInput): Proyecto | undefined {
  const proyectoIndex = proyectos.findIndex((item) => item.id === id);

  if (proyectoIndex === -1) {
    return undefined;
  }

  const updatedProyecto: Proyecto = {
    id,
    ...input
  };

  proyectos[proyectoIndex] = updatedProyecto;

  return { ...updatedProyecto };
}

function deleteProyecto(id: string): boolean {
  const proyectoIndex = proyectos.findIndex((item) => item.id === id);

  if (proyectoIndex === -1) {
    return false;
  }

  proyectos.splice(proyectoIndex, 1);

  return true;
}

function resetProyectoStore(): void {
  proyectos = [];
  nextProyectoId = 1;
}

export {
  createProyecto,
  deleteProyecto,
  getProyectoById,
  listProyectos,
  resetProyectoStore,
  updateProyecto
};
