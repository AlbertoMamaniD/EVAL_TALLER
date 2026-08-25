import { useCallback, useEffect, useRef, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { TareaForm } from "../components/TareaForm";
import { TareaTable } from "../components/TareaTable";
import {
  ApiError as ApiClientError,
  listProyectos,
  type Proyecto
} from "../services/proyectosApi";
import {
  createTarea,
  deleteTarea,
  listTareas,
  updateTarea,
  type Tarea,
  type TareaValidationErrors
} from "../services/tareasApi";
import {
  createEmptyTareaFormValues,
  toTareaPayload,
  validateTareaForm,
  type TareaFormValues
} from "./tareasValidation";

type TareaFilters = {
  estado: "" | TareaFormValues["estado"];
  prioridad: "" | TareaFormValues["prioridad"];
  proyectoId: string;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function getValidationErrors(error: unknown): TareaValidationErrors {
  if (error instanceof ApiClientError && error.errors) {
    return error.errors as TareaValidationErrors;
  }

  return {};
}

function toFormValues(tarea: Tarea): TareaFormValues {
  return {
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    proyectoId: tarea.proyectoId,
    prioridad: tarea.prioridad,
    estado: tarea.estado,
    fechaVencimiento: tarea.fechaVencimiento ?? ""
  };
}

function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isTareasLoading, setIsTareasLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<TareaFormValues>(
    createEmptyTareaFormValues()
  );
  const [formErrors, setFormErrors] = useState<TareaValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<TareaFormValues>(
    createEmptyTareaFormValues()
  );
  const [editingErrors, setEditingErrors] = useState<TareaValidationErrors>({});
  const [filters, setFilters] = useState<TareaFilters>({
    proyectoId: "",
    estado: "",
    prioridad: ""
  });
  const editingIdRef = useRef<string | null>(null);
  const filtersRef = useRef(filters);
  const isMountedRef = useRef(true);
  const tareasRequestIdRef = useRef(0);
  const isLoading = isProjectsLoading || isTareasLoading;

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      try {
        setIsProjectsLoading(true);
        setPageError(null);
        const proyectosResponse = await listProyectos();

        if (!isActive) {
          return;
        }

        setProyectos(proyectosResponse);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageError(getErrorMessage(error, "No se pudieron cargar las tareas."));
      } finally {
        if (isActive) {
          setIsProjectsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  const loadTareas = useCallback(async (nextFilters: TareaFilters) => {
    const requestId = tareasRequestIdRef.current + 1;
    tareasRequestIdRef.current = requestId;

    if (isMountedRef.current) {
      setIsTareasLoading(true);
    }

    try {
      const response = await listTareas(nextFilters);

      if (!isMountedRef.current || requestId !== tareasRequestIdRef.current) {
        return false;
      }

      setTareas(response);

      return true;
    } catch (error) {
      if (!isMountedRef.current || requestId !== tareasRequestIdRef.current) {
        return false;
      }

      throw error;
    } finally {
      if (isMountedRef.current && requestId === tareasRequestIdRef.current) {
        setIsTareasLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const loadFilteredTareas = async () => {
      try {
        setPageError(null);
        await loadTareas(filters);
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        setPageError(getErrorMessage(error, "No se pudieron cargar las tareas."));
      }
    };

    void loadFilteredTareas();
  }, [filters, loadTareas]);

  const projectIds = proyectos.map((proyecto) => proyecto.id);

  const reloadTareas = useCallback(
    async (nextFilters: TareaFilters = filtersRef.current) => {
      await loadTareas(nextFilters);
    },
    [loadTareas]
  );

  const handleCreateChange = (field: keyof TareaFormValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined
    }));
    setFormMessage(null);
  };

  const handleFilterChange = (field: keyof TareaFilters, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value
    }));
  };

  const handleEditChange = (field: keyof TareaFormValues, value: string) => {
    setEditingValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));
    setEditingErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined
    }));
    setPageError(null);
  };

  const handleCreateSubmit = async () => {
    if (isLoading || proyectos.length === 0) {
      return;
    }

    const nextErrors = validateTareaForm(formValues, projectIds);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    try {
      setIsCreating(true);
      setFormErrors({});
      setFormMessage(null);
      await createTarea(toTareaPayload(formValues));
      await reloadTareas();
      setFormValues(createEmptyTareaFormValues());
      setFormMessage("Tarea creada correctamente.");
    } catch (error) {
      setFormErrors(getValidationErrors(error));
      setFormMessage(getErrorMessage(error, "No se pudo crear la tarea."));
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditStart = (tarea: Tarea) => {
    if (savingId !== null) {
      return;
    }

    setEditingId(tarea.id);
    setEditingValues(toFormValues(tarea));
    setEditingErrors({});
    setPageError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValues(createEmptyTareaFormValues());
    setEditingErrors({});
  };

  const handleEditSubmit = async (id: string) => {
    const nextErrors = validateTareaForm(editingValues, projectIds);

    if (Object.keys(nextErrors).length > 0) {
      setEditingErrors(nextErrors);
      return;
    }

    try {
      setSavingId(id);
      setEditingErrors({});
      setPageError(null);
      await updateTarea(id, toTareaPayload(editingValues));
      await reloadTareas();

      if (editingIdRef.current === id) {
        handleEditCancel();
      }
    } catch (error) {
      setEditingErrors(getValidationErrors(error));
      setPageError(getErrorMessage(error, "No se pudo actualizar la tarea."));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (tarea: Tarea) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la tarea "${tarea.titulo}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingIds((currentDeletingIds) =>
        currentDeletingIds.includes(tarea.id)
          ? currentDeletingIds
          : [...currentDeletingIds, tarea.id]
      );
      setPageError(null);
      await deleteTarea(tarea.id);
      await reloadTareas();

      if (editingId === tarea.id) {
        handleEditCancel();
      }
    } catch (error) {
      setPageError(getErrorMessage(error, "No se pudo eliminar la tarea."));
    } finally {
      setDeletingIds((currentDeletingIds) =>
        currentDeletingIds.filter((currentId) => currentId !== tarea.id)
      );
    }
  };

  return (
    <PageLayout
      bodyClassName="content-grid"
      description="Registra tareas asociadas a proyectos, define prioridad, seguimiento y vencimientos en memoria."
      eyebrow="ABM de tareas"
      feedback={
        pageError || formMessage ? (
          <div
            className={`feedback-banner ${pageError ? "feedback-error" : "feedback-success"}`}
          >
            {pageError || formMessage}
          </div>
        ) : undefined
      }
      title="Gestor de tareas"
    >
        <TareaForm
          errors={formErrors}
          isDisabled={isLoading || isCreating || proyectos.length === 0}
          isSubmitting={isCreating}
          onChange={handleCreateChange}
          onSubmit={handleCreateSubmit}
          proyectos={proyectos}
          values={formValues}
        />

        <div className="list-column">
          <section className="panel">
            <div className="panel-heading">
              <p className="eyebrow">Filtros</p>
              <h2>Buscar tareas</h2>
            </div>
            <div className="filter-grid">
              <label className="field">
                <span>Proyecto</span>
                <select
                  value={filters.proyectoId}
                  onChange={(event) =>
                    handleFilterChange("proyectoId", event.target.value)
                  }
                >
                  <option value="">Todos los proyectos</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Estado</span>
                <select
                  value={filters.estado}
                  onChange={(event) => handleFilterChange("estado", event.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="hecha">Hecha</option>
                </select>
              </label>

              <label className="field">
                <span>Prioridad</span>
                <select
                  value={filters.prioridad}
                  onChange={(event) =>
                    handleFilterChange("prioridad", event.target.value)
                  }
                >
                  <option value="">Todas las prioridades</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </label>
            </div>
          </section>

          <TareaTable
            deletingIds={deletingIds}
            editingErrors={editingErrors}
            editingId={editingId}
            editingValues={editingValues}
            isLoading={isLoading}
            onCancelEdit={handleEditCancel}
            onDelete={handleDelete}
            onEdit={handleEditStart}
            onEditChange={handleEditChange}
            onSaveEdit={handleEditSubmit}
            proyectos={proyectos}
            savingId={savingId}
            tareas={tareas}
          />
        </div>
    </PageLayout>
  );
}

export default TareasPage;
