import { describe, expect, it } from "vitest";
import {
  createEmptyTareaFormValues,
  toTareaPayload,
  validateTareaForm
} from "./tareasValidation";

describe("tareasValidation", () => {
  it("valida que el titulo sea obligatorio", () => {
    const errors = validateTareaForm(
      {
        ...createEmptyTareaFormValues(),
        titulo: "   ",
        proyectoId: "1"
      },
      ["1"]
    );

    expect(errors.titulo).toBe("El titulo es obligatorio.");
  });

  it("valida que el proyecto exista", () => {
    const errors = validateTareaForm(
      {
        ...createEmptyTareaFormValues(),
        titulo: "Preparar entrega",
        proyectoId: "999"
      },
      ["1", "2"]
    );

    expect(errors.proyectoId).toBe("El proyecto seleccionado no existe.");
  });

  it("valida que la fecha de vencimiento sea correcta", () => {
    const errors = validateTareaForm(
      {
        ...createEmptyTareaFormValues(),
        titulo: "Preparar entrega",
        proyectoId: "1",
        fechaVencimiento: "2026-02-30"
      },
      ["1"]
    );

    expect(errors.fechaVencimiento).toBe(
      "La fecha de vencimiento debe ser una fecha valida."
    );
  });

  it("normaliza el payload antes de enviarlo a la API", () => {
    const payload = toTareaPayload({
      titulo: "  Preparar entrega  ",
      descripcion: "  Subir release  ",
      proyectoId: " 1 ",
      prioridad: "alta",
      estado: "hecha",
      fechaVencimiento: ""
    });

    expect(payload).toEqual({
      titulo: "Preparar entrega",
      descripcion: "Subir release",
      proyectoId: "1",
      prioridad: "alta",
      estado: "hecha",
      fechaVencimiento: null
    });
  });
});
