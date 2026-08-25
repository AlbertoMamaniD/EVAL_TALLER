import type {
  Proyecto,
  ProyectoValidationErrors,
} from "../services/proyectosApi";
import type { ProyectoFormValues } from "../pages/proyectosValidation";

type ProyectoTableProps = {
  deletingIds: string[];
  editingErrors: ProyectoValidationErrors;
  editingId: string | null;
  editingValues: ProyectoFormValues;
  isLoading: boolean;
  onCancelEdit: () => void;
  onDelete: (proyecto: Proyecto) => void;
  onEdit: (proyecto: Proyecto) => void;
  onEditChange: (field: keyof ProyectoFormValues, value: string) => void;
  onSaveEdit: (id: string) => void;
  proyectos: Proyecto[];
  savingId: string | null;
};

function formatFechaLimite(value: string | null): string {
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
    year: "numeric",
  }).format(date);
}

function ProyectoTable({
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
}: ProyectoTableProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Listado</p>
        <h2>Proyectos</h2>
      </div>

      {isLoading && <p className="muted">Cargando proyectos...</p>}
      {!isLoading && proyectos.length === 0 && (
        <p className="muted">Todavia no hay proyectos cargados.</p>
      )}

      {!isLoading && proyectos.length > 0 && (
        <div className="table-wrapper">
          <table className="project-table project-table-proyectos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Fecha limite</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((proyecto) => {
                const isEditing = proyecto.id === editingId;
                const isSaving = proyecto.id === savingId;
                const isDeleting = deletingIds.includes(proyecto.id);
                const isInteractionLocked = savingId !== null || isDeleting;

                return (
                  <tr key={proyecto.id}>
                    <td data-label="Nombre">
                      {isEditing ? (
                        <div className="cell-field">
                          <input
                            type="text"
                            value={editingValues.nombre}
                            onChange={(event) =>
                              onEditChange("nombre", event.target.value)
                            }
                          />
                          {editingErrors.nombre && (
                            <small className="error-text">
                              {editingErrors.nombre}
                            </small>
                          )}
                        </div>
                      ) : (
                        proyecto.nombre
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
                        proyecto.descripcion || "Sin descripcion"
                      )}
                    </td>
                    <td data-label="Fecha limite">
                      {isEditing ? (
                        <div className="cell-field">
                          <input
                            type="date"
                            value={editingValues.fechaLimite}
                            onChange={(event) =>
                              onEditChange("fechaLimite", event.target.value)
                            }
                          />
                          {editingErrors.fechaLimite && (
                            <small className="error-text">
                              {editingErrors.fechaLimite}
                            </small>
                          )}
                        </div>
                      ) : (
                        formatFechaLimite(proyecto.fechaLimite)
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
                          <option value="activo">Activo</option>
                          <option value="cerrado">Cerrado</option>
                        </select>
                      ) : (
                        <span
                          className={`status-pill status-${proyecto.estado}`}
                        >
                          {proyecto.estado}
                        </span>
                      )}
                    </td>
                    <td data-label="Acciones">
                      <div className="row-actions">
                        {isEditing ? (
                          <>
                            <button
                              className="button button-primary"
                              type="button"
                              onClick={() => onSaveEdit(proyecto.id)}
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
                              onClick={() => onEdit(proyecto)}
                              disabled={isInteractionLocked}
                            >
                              Editar
                            </button>
                            <button
                              className="button button-danger"
                              type="button"
                              onClick={() => onDelete(proyecto)}
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

export { ProyectoTable };
