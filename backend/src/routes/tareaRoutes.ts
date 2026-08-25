import { Router } from "express";
import {
  createTarea,
  deleteTarea,
  findTareaById,
  listTareas,
  updateTarea
} from "../services/tareaService.js";

const tareaRoutes = Router();

tareaRoutes.get("/", (request, response) => {
  response.json(
    listTareas({
      proyectoId:
        typeof request.query.proyectoId === "string"
          ? request.query.proyectoId
          : undefined,
      estado:
        typeof request.query.estado === "string" ? request.query.estado : undefined,
      prioridad:
        typeof request.query.prioridad === "string"
          ? request.query.prioridad
          : undefined
    })
  );
});

tareaRoutes.get("/:id", (request, response) => {
  const tarea = findTareaById(request.params.id);

  if (!tarea) {
    response.status(404).json({ message: "Tarea no encontrada." });
    return;
  }

  response.json(tarea);
});

tareaRoutes.post("/", (request, response) => {
  const result = createTarea(request.body);

  if (!result.success) {
    response.status(400).json({
      message: "Datos de tarea invalidos.",
      errors: result.errors
    });
    return;
  }

  response.status(201).json(result.data);
});

tareaRoutes.put("/:id", (request, response) => {
  const result = updateTarea(request.params.id, request.body);

  if (result === null) {
    response.status(404).json({ message: "Tarea no encontrada." });
    return;
  }

  if (!result.success) {
    response.status(400).json({
      message: "Datos de tarea invalidos.",
      errors: result.errors
    });
    return;
  }

  response.json(result.data);
});

tareaRoutes.delete("/:id", (request, response) => {
  const deleted = deleteTarea(request.params.id);

  if (!deleted) {
    response.status(404).json({ message: "Tarea no encontrada." });
    return;
  }

  response.status(204).send();
});

export { tareaRoutes };
