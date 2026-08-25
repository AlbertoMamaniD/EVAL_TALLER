import { Router } from "express";
import {
  createProyecto,
  deleteProyecto,
  findProyectoById,
  listProyectos,
  updateProyecto
} from "../services/proyectoService.js";

const proyectoRoutes = Router();

proyectoRoutes.get("/", (_request, response) => {
  response.json(listProyectos());
});

proyectoRoutes.get("/:id", (request, response) => {
  const proyecto = findProyectoById(request.params.id);

  if (!proyecto) {
    response.status(404).json({ message: "Proyecto no encontrado." });
    return;
  }

  response.json(proyecto);
});

proyectoRoutes.post("/", (request, response) => {
  const result = createProyecto(request.body);

  if (!result.success) {
    response.status(400).json({
      message: "Datos de proyecto invalidos.",
      errors: result.errors
    });
    return;
  }

  response.status(201).json(result.data);
});

proyectoRoutes.put("/:id", (request, response) => {
  const result = updateProyecto(request.params.id, request.body);

  if (result === null) {
    response.status(404).json({ message: "Proyecto no encontrado." });
    return;
  }

  if (!result.success) {
    response.status(400).json({
      message: "Datos de proyecto invalidos.",
      errors: result.errors
    });
    return;
  }

  response.json(result.data);
});

proyectoRoutes.delete("/:id", (request, response) => {
  const deleted = deleteProyecto(request.params.id);

  if (deleted === "not_found") {
    response.status(404).json({ message: "Proyecto no encontrado." });
    return;
  }

  if (deleted === "has_tasks") {
    response.status(400).json({
      message: "No se puede eliminar el proyecto porque tiene tareas asociadas."
    });
    return;
  }

  response.status(204).send();
});

export { proyectoRoutes };
