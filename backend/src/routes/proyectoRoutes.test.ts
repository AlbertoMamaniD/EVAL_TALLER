import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../app.js";
import { resetProyectoStore } from "../store/proyectoStore.js";

describe("proyectoRoutes", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    resetProyectoStore();
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

  it("crea un proyecto correctamente", async () => {
    const response = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Implementar tablero",
        descripcion: "Sprint inicial",
        fechaLimite: "2026-09-10"
      })
    });

    const proyecto = (await response.json()) as {
      id: string;
      nombre: string;
      descripcion: string;
      fechaLimite: string | null;
      estado: string;
    };

    expect(response.status).toBe(201);
    expect(proyecto).toMatchObject({
      id: "1",
      nombre: "Implementar tablero",
      descripcion: "Sprint inicial",
      fechaLimite: "2026-09-10",
      estado: "activo"
    });
  });

  it("rechaza la creacion sin nombre", async () => {
    const response = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "   ",
        fechaLimite: "2026-09-10"
      })
    });

    const payload = (await response.json()) as {
      message: string;
      errors: {
        nombre?: string;
      };
    };

    expect(response.status).toBe(400);
    expect(payload.message).toBe("Datos de proyecto invalidos.");
    expect(payload.errors.nombre).toBe("El nombre es obligatorio.");
  });

  it("rechaza fechas imposibles al crear", async () => {
    const response = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto con fecha invalida",
        fechaLimite: "2026-02-30"
      })
    });

    const payload = (await response.json()) as {
      errors: {
        fechaLimite?: string;
      };
    };

    expect(response.status).toBe(400);
    expect(payload.errors.fechaLimite).toBe(
      "La fecha limite debe ser una fecha valida."
    );
  });

  it("acepta fechas validas con anios tempranos al crear", async () => {
    const response = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto historico",
        fechaLimite: "0099-12-31"
      })
    });

    const proyecto = (await response.json()) as {
      fechaLimite: string | null;
    };

    expect(response.status).toBe(201);
    expect(proyecto.fechaLimite).toBe("0099-12-31");
  });

  it("acepta dias bisiestos validos al crear", async () => {
    const response = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto bisiesto",
        fechaLimite: "0004-02-29"
      })
    });

    const proyecto = (await response.json()) as {
      fechaLimite: string | null;
    };

    expect(response.status).toBe(201);
    expect(proyecto.fechaLimite).toBe("0004-02-29");
  });

  it("edita un proyecto existente", async () => {
    const createResponse = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto original",
        descripcion: "Primera version"
      })
    });
    const createdProyecto = (await createResponse.json()) as { id: string };

    const updateResponse = await fetch(
      `${baseUrl}/api/proyectos/${createdProyecto.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: "Proyecto actualizado",
          descripcion: "Segunda version",
          fechaLimite: "2026-10-01",
          estado: "cerrado"
        })
      }
    );

    const proyectoActualizado = (await updateResponse.json()) as {
      nombre: string;
      descripcion: string;
      fechaLimite: string | null;
      estado: string;
    };

    expect(updateResponse.status).toBe(200);
    expect(proyectoActualizado).toMatchObject({
      nombre: "Proyecto actualizado",
      descripcion: "Segunda version",
      fechaLimite: "2026-10-01",
      estado: "cerrado"
    });
  });

  it("rechaza fechas imposibles al editar", async () => {
    const createResponse = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto base"
      })
    });
    const createdProyecto = (await createResponse.json()) as { id: string };

    const updateResponse = await fetch(
      `${baseUrl}/api/proyectos/${createdProyecto.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: "Proyecto base",
          fechaLimite: "2027-02-29"
        })
      }
    );

    const payload = (await updateResponse.json()) as {
      errors: {
        fechaLimite?: string;
      };
    };

    expect(updateResponse.status).toBe(400);
    expect(payload.errors.fechaLimite).toBe(
      "La fecha limite debe ser una fecha valida."
    );
  });

  it("borra un proyecto existente", async () => {
    const createResponse = await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto a borrar"
      })
    });
    const createdProyecto = (await createResponse.json()) as { id: string };

    const deleteResponse = await fetch(
      `${baseUrl}/api/proyectos/${createdProyecto.id}`,
      {
        method: "DELETE"
      }
    );
    const listResponse = await fetch(`${baseUrl}/api/proyectos`);
    const proyectos = (await listResponse.json()) as Array<{ id: string }>;

    expect(deleteResponse.status).toBe(204);
    expect(proyectos).toHaveLength(0);
  });

  it("lista los proyectos cargados", async () => {
    await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto A"
      })
    });
    await fetch(`${baseUrl}/api/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Proyecto B",
        estado: "cerrado"
      })
    });

    const response = await fetch(`${baseUrl}/api/proyectos`);
    const proyectos = (await response.json()) as Array<{
      nombre: string;
      estado: string;
    }>;

    expect(response.status).toBe(200);
    expect(proyectos).toHaveLength(2);
    expect(proyectos).toEqual([
      expect.objectContaining({
        nombre: "Proyecto A",
        estado: "activo"
      }),
      expect.objectContaining({
        nombre: "Proyecto B",
        estado: "cerrado"
      })
    ]);
  });
});
