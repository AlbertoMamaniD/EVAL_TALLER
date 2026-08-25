import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../app.js";
import { resetProyectoStore } from "../store/proyectoStore.js";
import { resetTareaStore } from "../store/tareaStore.js";

describe("dashboardRoutes", () => {
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

  async function createTarea(payload: {
    estado?: "pendiente" | "en_progreso" | "hecha";
    proyectoId: string;
    titulo: string;
  }): Promise<void> {
    await fetch(`${baseUrl}/api/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  }

  it("devuelve el resumen de tareas por proyecto", async () => {
    const proyectoA = await createProyecto("Proyecto A");
    const proyectoB = await createProyecto("Proyecto B");

    await createTarea({
      titulo: "Pendiente A",
      proyectoId: proyectoA.id,
      estado: "pendiente"
    });
    await createTarea({
      titulo: "En progreso A",
      proyectoId: proyectoA.id,
      estado: "en_progreso"
    });
    await createTarea({
      titulo: "Hecha A",
      proyectoId: proyectoA.id,
      estado: "hecha"
    });
    await createTarea({
      titulo: "Pendiente B",
      proyectoId: proyectoB.id,
      estado: "pendiente"
    });

    const response = await fetch(`${baseUrl}/api/dashboard/resumen`);
    const resumen = (await response.json()) as Array<{
      nombreProyecto: string;
      tareasEnProgreso: number;
      tareasHechas: number;
      tareasPendientes: number;
      totalTareas: number;
    }>;

    expect(response.status).toBe(200);
    expect(resumen).toEqual([
      {
        proyectoId: proyectoA.id,
        nombreProyecto: "Proyecto A",
        totalTareas: 3,
        tareasPendientes: 1,
        tareasEnProgreso: 1,
        tareasHechas: 1
      },
      {
        proyectoId: proyectoB.id,
        nombreProyecto: "Proyecto B",
        totalTareas: 1,
        tareasPendientes: 1,
        tareasEnProgreso: 0,
        tareasHechas: 0
      }
    ]);
  });
});
