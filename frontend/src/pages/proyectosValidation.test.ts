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

  it("valida el largo maximo de nombre y descripcion", () => {
    const errors = validateProyectoForm({
      ...createEmptyProyectoFormValues(),
      nombre: "N".repeat(101),
      descripcion: "D".repeat(501)
    });

    expect(errors.nombre).toBe("El nombre no puede superar los 100 caracteres.");
    expect(errors.descripcion).toBe(
      "La descripcion no puede superar los 500 caracteres."
    );
  });

  it("rechaza fechas calendario imposibles", () => {
    const errors = validateProyectoForm({
      ...createEmptyProyectoFormValues(),
      nombre: "Proyecto demo",
      fechaLimite: "2026-02-30"
    });

    expect(errors.fechaLimite).toBe("La fecha limite debe ser una fecha valida.");
  });

  it("acepta anios tempranos validos", () => {
    const errors = validateProyectoForm({
      ...createEmptyProyectoFormValues(),
      nombre: "Proyecto demo",
      fechaLimite: "0099-12-31"
    });

    expect(errors.fechaLimite).toBeUndefined();
  });

  it("acepta dias bisiestos validos", () => {
    const errors = validateProyectoForm({
      ...createEmptyProyectoFormValues(),
      nombre: "Proyecto demo",
      fechaLimite: "0004-02-29"
    });

    expect(errors.fechaLimite).toBeUndefined();
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
