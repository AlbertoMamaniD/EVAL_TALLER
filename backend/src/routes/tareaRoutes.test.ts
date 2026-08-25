import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../app.js";
import { resetProyectoStore } from "../store/proyectoStore.js";
import { resetTareaStore } from "../store/tareaStore.js";

describe("tareaRoutes", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    resetProyectoStore();
    resetTareaStore();
    server = createApp().listen(0);
    await once(server, "listening");

    const address = server.address() as AddressInfo | null;

    if (!address) {
      throw new Error("No se pudo obtener el puerto del servidor de pruebas.");
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  async function createProyecto(nombre: string): Promise<{ id: string }> {
    const response = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre })
    });

    return (await response.json()) as { id: string };
  }

  it("crea una tarea correctamente", async () => {
    const proyecto = await createProyecto("Proyecto base");

    const response = await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Preparar entrega",
        descripcion: "Subir entregable final",
        proyectoId: proyecto.id,
        prioridad: "alta",
        estado: "en_progreso",
        fechaVencimiento: "2026-09-05"
      })
    });

    const tarea = (await response.json()) as {
      id: string;
      titulo: string;
      proyectoId: string;
      prioridad: string;
      estado: string;
      fechaVencimiento: string | null;
    };

    expect(response.status).toBe(201);
    expect(tarea).toMatchObject({
      id: "1",
      titulo: "Preparar entrega",
      proyectoId: proyecto.id,
      prioridad: "alta",
      estado: "en_progreso",
      fechaVencimiento: "2026-09-05"
    });
  });

  it("rechaza crear una tarea con proyecto inexistente", async () => {
    const response = await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Tarea huerfana",
        proyectoId: "999"
      })
    });

    const payload = (await response.json()) as {
      message: string;
      errors: {
        proyectoId?: string;
      };
    };

    expect(response.status).toBe(400);
    expect(payload.message).toBe("Datos de tarea invalidos.");
    expect(payload.errors.proyectoId).toBe("El proyecto seleccionado no existe.");
  });

  it("edita una tarea existente", async () => {
    const proyectoA = await createProyecto("Proyecto A");
    const proyectoB = await createProyecto("Proyecto B");
    const createResponse = await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Diseniar mockup",
        proyectoId: proyectoA.id
      })
    });
    const createdTarea = (await createResponse.json()) as { id: string };

    const updateResponse = await fetch(`${baseUrl}/api/tareas/${createdTarea.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Diseniar mockup final",
        descripcion: "Con ajustes del cliente",
        proyectoId: proyectoB.id,
        prioridad: "media",
        estado: "hecha",
        fechaVencimiento: "2026-10-10"
      })
    });

    const tareaActualizada = (await updateResponse.json()) as {
      titulo: string;
      descripcion: string;
      proyectoId: string;
      prioridad: string;
      estado: string;
      fechaVencimiento: string | null;
    };

    expect(updateResponse.status).toBe(200);
    expect(tareaActualizada).toMatchObject({
      titulo: "Diseniar mockup final",
      descripcion: "Con ajustes del cliente",
      proyectoId: proyectoB.id,
      prioridad: "media",
      estado: "hecha",
      fechaVencimiento: "2026-10-10"
    });
  });

  it("borra una tarea existente", async () => {
    const proyecto = await createProyecto("Proyecto base");
    const createResponse = await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Tarea a borrar",
        proyectoId: proyecto.id
      })
    });
    const createdTarea = (await createResponse.json()) as { id: string };

    const deleteResponse = await fetch(`${baseUrl}/api/tareas/${createdTarea.id}`, {
      method: "DELETE"
    });
    const listResponse = await fetch(`${baseUrl}/api/tareas`);
    const tareas = (await listResponse.json()) as Array<{ id: string }>;

    expect(deleteResponse.status).toBe(204);
    expect(tareas).toHaveLength(0);
  });

  it("lista las tareas cargadas", async () => {
    const proyecto = await createProyecto("Proyecto base");

    await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Tarea A",
        proyectoId: proyecto.id,
        prioridad: "baja"
      })
    });
    await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Tarea B",
        proyectoId: proyecto.id,
        prioridad: "alta"
      })
    });

    const response = await fetch(`${baseUrl}/api/tareas`);
    const tareas = (await response.json()) as Array<{
      titulo: string;
      prioridad: string;
    }>;

    expect(response.status).toBe(200);
    expect(tareas).toHaveLength(2);
    expect(tareas).toEqual([
      expect.objectContaining({
        titulo: "Tarea A",
        prioridad: "baja"
      }),
      expect.objectContaining({
        titulo: "Tarea B",
        prioridad: "alta"
      })
    ]);
  });

  it("filtra tareas por proyecto", async () => {
    const proyectoA = await createProyecto("Proyecto A");
    const proyectoB = await createProyecto("Proyecto B");

    await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Tarea A1",
        proyectoId: proyectoA.id
      })
    });
    await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Tarea B1",
        proyectoId: proyectoB.id
      })
    });

    const response = await fetch(`${baseUrl}/api/tareas?proyectoId=${proyectoA.id}`);
    const tareas = (await response.json()) as Array<{
      titulo: string;
      proyectoId: string;
    }>;

    expect(response.status).toBe(200);
    expect(tareas).toEqual([
      expect.objectContaining({
        titulo: "Tarea A1",
        proyectoId: proyectoA.id
      })
    ]);
  });
});
