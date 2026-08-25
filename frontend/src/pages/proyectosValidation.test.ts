import { describe, expect, it } from "vitest";
import {
  createEmptyProyectoFormValues,
  toProyectoPayload,
  validateProyectoForm
} from "./proyectosValidation";

describe("proyectosValidation", () => {
  it("valida que el nombre sea obligatorio", () => {
    const errors = validateProyectoForm({
      ...createEmptyProyectoFormValues(),
      nombre: "   "
    });

    expect(errors.nombre).toBe("El nombre es obligatorio.");
  });

  it("valida que la fecha limite sea correcta si se informa", () => {
    const errors = validateProyectoForm({
      ...createEmptyProyectoFormValues(),
      nombre: "Proyecto demo",
      fechaLimite: "fecha-invalida"
    });

    expect(errors.fechaLimite).toBe("La fecha limite debe ser una fecha valida.");
  });

  it("normaliza el payload antes de enviarlo a la API", () => {
    const payload = toProyectoPayload({
      nombre: "  Proyecto demo  ",
      descripcion: "  Descripcion  ",
      fechaLimite: "",
      estado: "cerrado"
    });

    expect(payload).toEqual({
      nombre: "Proyecto demo",
      descripcion: "Descripcion",
      fechaLimite: null,
      estado: "cerrado"
    });
  });
});
