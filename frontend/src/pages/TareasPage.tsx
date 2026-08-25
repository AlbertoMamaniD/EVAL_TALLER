import { useEffect, useRef, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
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
  const editingIdRef = useRef<string | null>(null);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setPageError(null);
        const [proyectosResponse, tareasResponse] = await Promise.all([
          listProyectos(),
          listTareas()
        ]);

        if (!isActive) {
          return;
        }

        setProyectos(proyectosResponse);
        setTareas(tareasResponse);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageError(getErrorMessage(error, "No se pudieron cargar las tareas."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  const projectIds = proyectos.map((proyecto) => proyecto.id);

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
      const createdTarea = await createTarea(toTareaPayload(formValues));

      setTareas((currentTareas) => [...currentTareas, createdTarea]);
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
      const updatedTarea = await updateTarea(id, toTareaPayload(editingValues));

      setTareas((currentTareas) =>
        currentTareas.map((tarea) => (tarea.id === id ? updatedTarea : tarea))
      );

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
      setTareas((currentTareas) =>
        currentTareas.filter((item) => item.id !== tarea.id)
      );

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
    <main className="app-shell app-shell-projects">
      <section className="hero">
        <p className="eyebrow">ABM de tareas</p>
        <h1>Gestor de tareas</h1>
        <p className="hero-copy">
          Registra tareas asociadas a proyectos, define prioridad, seguimiento y
          vencimientos en memoria.
        </p>
      </section>

      {(pageError || formMessage) && (
        <div className={`feedback-banner ${pageError ? "feedback-error" : "feedback-success"}`}>
          {pageError || formMessage}
        </div>
      )}

      <div className="content-grid">
        <TareaForm
          errors={formErrors}
          isDisabled={isLoading || isCreating || proyectos.length === 0}
          isSubmitting={isCreating}
          onChange={handleCreateChange}
          onSubmit={handleCreateSubmit}
          proyectos={proyectos}
          values={formValues}
        />

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
    </main>
  );
}

export default TareasPage;
