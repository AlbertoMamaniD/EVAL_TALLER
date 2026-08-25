import type { Proyecto } from "../services/proyectosApi";
import type { TareaValidationErrors } from "../services/tareasApi";
import type { TareaFormValues } from "../pages/tareasValidation";

type TareaFormProps = {
  errors: TareaValidationErrors;
  isDisabled: boolean;
  isSubmitting: boolean;
  onChange: (field: keyof TareaFormValues, value: string) => void;
  onSubmit: () => void;
  proyectos: Proyecto[];
  values: TareaFormValues;
};

function TareaForm({
  errors,
  isDisabled,
  isSubmitting,
  onChange,
  onSubmit,
  proyectos,
  values
}: TareaFormProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Alta de tarea</p>
        <h2>Nueva tarea</h2>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Titulo</span>
          <input
            name="titulo"
            type="text"
            value={values.titulo}
            disabled={isDisabled}
            onChange={(event) => onChange("titulo", event.target.value)}
            placeholder="Ej. Revisar requerimientos"
          />
          {errors.titulo && <small className="error-text">{errors.titulo}</small>}
        </label>

        <label className="field">
          <span>Proyecto</span>
          <select
            name="proyectoId"
            value={values.proyectoId}
            disabled={isDisabled}
            onChange={(event) => onChange("proyectoId", event.target.value)}
          >
            <option value="">Selecciona un proyecto</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
          {errors.proyectoId && (
            <small className="error-text">{errors.proyectoId}</small>
          )}
        </label>

        <label className="field">
          <span>Prioridad</span>
          <select
            name="prioridad"
            value={values.prioridad}
            disabled={isDisabled}
            onChange={(event) => onChange("prioridad", event.target.value)}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>

        <label className="field">
          <span>Estado</span>
          <select
            name="estado"
            value={values.estado}
            disabled={isDisabled}
            onChange={(event) => onChange("estado", event.target.value)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="hecha">Hecha</option>
          </select>
        </label>

        <label className="field">
          <span>Fecha de vencimiento</span>
          <input
            name="fechaVencimiento"
            type="date"
            value={values.fechaVencimiento}
            disabled={isDisabled}
            onChange={(event) => onChange("fechaVencimiento", event.target.value)}
          />
          {errors.fechaVencimiento && (
            <small className="error-text">{errors.fechaVencimiento}</small>
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
            placeholder="Describe el trabajo a realizar"
          />
          {errors.descripcion && (
            <small className="error-text">{errors.descripcion}</small>
          )}
        </label>
      </div>

      {proyectos.length === 0 && (
        <p className="muted">
          Necesitas crear al menos un proyecto antes de registrar tareas.
        </p>
      )}

      <div className="panel-actions">
        <button
          className="button button-primary"
          type="button"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {isSubmitting ? "Guardando..." : "Crear tarea"}
        </button>
      </div>
    </section>
  );
}

export { TareaForm };
