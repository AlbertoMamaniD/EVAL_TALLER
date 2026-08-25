import type { ProyectoValidationErrors } from "../services/proyectosApi";
import type { ProyectoFormValues } from "../pages/proyectosValidation";

type ProyectoFormProps = {
  errors: ProyectoValidationErrors;
  isDisabled: boolean;
  isSubmitting: boolean;
  onChange: (field: keyof ProyectoFormValues, value: string) => void;
  onSubmit: () => void;
  values: ProyectoFormValues;
};

function ProyectoForm({
  errors,
  isDisabled,
  isSubmitting,
  onChange,
  onSubmit,
  values,
}: ProyectoFormProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Alta de proyecto</p>
        <h2>Nuevo proyecto</h2>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Nombre</span>
          <input
            name="nombre"
            type="text"
            value={values.nombre}
            disabled={isDisabled}
            onChange={(event) => onChange("nombre", event.target.value)}
            placeholder="Ej. Rediseno del portal"
          />
          {errors.nombre && (
            <small className="error-text">{errors.nombre}</small>
          )}
        </label>

        <label className="field">
          <span>Fecha limite</span>
          <input
            name="fechaLimite"
            type="date"
            value={values.fechaLimite}
            disabled={isDisabled}
            onChange={(event) => onChange("fechaLimite", event.target.value)}
          />
          {errors.fechaLimite && (
            <small className="error-text">{errors.fechaLimite}</small>
          )}
        </label>

        <label className="field field-full">
          <span>Descripcion</span>
          <textarea
            name="descripcion"
            rows={4}
            value={values.descripcion}
            disabled={isDisabled}
            onChange={(event) => onChange("descripcion", event.target.value)}
            placeholder="Describe el alcance o contexto del proyecto"
          />
          {errors.descripcion && (
            <small className="error-text">{errors.descripcion}</small>
          )}
        </label>

        <label className="field">
          <span>Estado</span>
          <select
            name="estado"
            value={values.estado}
            disabled={isDisabled}
            onChange={(event) => onChange("estado", event.target.value)}
          >
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </label>
      </div>

      <div className="panel-actions">
        <button
          className="button button-primary"
          type="button"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {isSubmitting ? "Guardando..." : "Crear proyecto"}
        </button>
      </div>
    </section>
  );
}

export { ProyectoForm };
