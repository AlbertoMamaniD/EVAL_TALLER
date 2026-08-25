import type { Proyecto } from "../services/proyectosApi";
import type { Tarea, TareaValidationErrors } from "../services/tareasApi";
import type { TareaFormValues } from "../pages/tareasValidation";

type TareaTableProps = {
  deletingIds: string[];
  editingErrors: TareaValidationErrors;
  editingId: string | null;
  editingValues: TareaFormValues;
  isLoading: boolean;
  onCancelEdit: () => void;
  onDelete: (tarea: Tarea) => void;
  onEdit: (tarea: Tarea) => void;
  onEditChange: (field: keyof TareaFormValues, value: string) => void;
  onSaveEdit: (id: string) => void;
  proyectos: Proyecto[];
  savingId: string | null;
  tareas: Tarea[];
};

function formatFechaVencimiento(value: string | null): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function TareaTable({
  deletingIds,
  editingErrors,
  editingId,
  editingValues,
  isLoading,
  onCancelEdit,
  onDelete,
  onEdit,
  onEditChange,
  onSaveEdit,
  proyectos,
  savingId,
  tareas
}: TareaTableProps) {
  const proyectosById = Object.fromEntries(
    proyectos.map((proyecto) => [proyecto.id, proyecto.nombre])
  );

  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Listado</p>
        <h2>Tareas</h2>
      </div>

      {isLoading && <p className="muted">Cargando tareas...</p>}
      {!isLoading && tareas.length === 0 && (
        <p className="muted">Todavia no hay tareas cargadas.</p>
      )}

      {!isLoading && tareas.length > 0 && (
        <div className="table-wrapper">
          <table className="project-table project-table-tareas">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Proyecto</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th>Descripcion</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((tarea) => {
                const isEditing = tarea.id === editingId;
                const isSaving = tarea.id === savingId;
                const isDeleting = deletingIds.includes(tarea.id);
                const isInteractionLocked = savingId !== null || isDeleting;

                return (
                  <tr key={tarea.id}>
                    <td data-label="Titulo">
                      {isEditing ? (
                        <div className="cell-field">
                          <input
                            type="text"
                            value={editingValues.titulo}
                            onChange={(event) =>
                              onEditChange("titulo", event.target.value)
                            }
                          />
                          {editingErrors.titulo && (
                            <small className="error-text">{editingErrors.titulo}</small>
                          )}
                        </div>
                      ) : (
                        tarea.titulo
                      )}
                    </td>
                    <td data-label="Proyecto">
                      {isEditing ? (
                        <div className="cell-field">
                          <select
                            value={editingValues.proyectoId}
                            onChange={(event) =>
                              onEditChange("proyectoId", event.target.value)
                            }
                          >
                            <option value="">Selecciona un proyecto</option>
                            {proyectos.map((proyecto) => (
                              <option key={proyecto.id} value={proyecto.id}>
                                {proyecto.nombre}
                              </option>
                            ))}
                          </select>
                          {editingErrors.proyectoId && (
                            <small className="error-text">
                              {editingErrors.proyectoId}
                            </small>
                          )}
                        </div>
                      ) : (
                        proyectosById[tarea.proyectoId] || "Proyecto eliminado"
                      )}
                    </td>
                    <td data-label="Prioridad">
                      {isEditing ? (
                        <select
                          value={editingValues.prioridad}
                          onChange={(event) =>
                            onEditChange("prioridad", event.target.value)
                          }
                        >
                          <option value="baja">Baja</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                        </select>
                      ) : (
                        <span className={`badge badge-prioridad-${tarea.prioridad}`}>
                          {tarea.prioridad}
                        </span>
                      )}
                    </td>
                    <td data-label="Estado">
                      {isEditing ? (
                        <select
                          value={editingValues.estado}
                          onChange={(event) =>
                            onEditChange("estado", event.target.value)
                          }
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_progreso">En progreso</option>
                          <option value="hecha">Hecha</option>
                        </select>
                      ) : (
                        <span className={`badge badge-estado-${tarea.estado}`}>
                          {tarea.estado.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td data-label="Vencimiento">
                      {isEditing ? (
                        <div className="cell-field">
                          <input
                            type="date"
                            value={editingValues.fechaVencimiento}
                            onChange={(event) =>
                              onEditChange("fechaVencimiento", event.target.value)
                            }
                          />
                          {editingErrors.fechaVencimiento && (
                            <small className="error-text">
                              {editingErrors.fechaVencimiento}
                            </small>
                          )}
                        </div>
                      ) : (
                        formatFechaVencimiento(tarea.fechaVencimiento)
                      )}
                    </td>
                    <td data-label="Descripcion">
                      {isEditing ? (
                        <div className="cell-field">
                          <textarea
                            rows={3}
                            value={editingValues.descripcion}
                            onChange={(event) =>
                              onEditChange("descripcion", event.target.value)
                            }
                          />
                          {editingErrors.descripcion && (
                            <small className="error-text">
                              {editingErrors.descripcion}
                            </small>
                          )}
                        </div>
                      ) : (
                        tarea.descripcion || "Sin descripcion"
                      )}
                    </td>
                    <td data-label="Acciones">
                      <div className="row-actions">
                        {isEditing ? (
                          <>
                            <button
                              className="button button-primary"
                              type="button"
                              onClick={() => onSaveEdit(tarea.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={onCancelEdit}
                              disabled={isSaving}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => onEdit(tarea)}
                              disabled={isInteractionLocked}
                            >
                              Editar
                            </button>
                            <button
                              className="button button-danger"
                              type="button"
                              onClick={() => onDelete(tarea)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export { TareaTable };
