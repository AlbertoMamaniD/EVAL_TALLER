import { useEffect, useState } from "react";
import { ProyectoForm } from "../components/ProyectoForm";
import { ProyectoTable } from "../components/ProyectoTable";
import {
  ApiError,
  createProyecto,
  deleteProyecto,
  listProyectos,
  updateProyecto,
  type Proyecto,
  type ProyectoValidationErrors
} from "../services/proyectosApi";
import {
  createEmptyProyectoFormValues,
  toProyectoPayload,
  validateProyectoForm,
  type ProyectoFormValues
} from "./proyectosValidation";

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function getValidationErrors(error: unknown): ProyectoValidationErrors {
  if (error instanceof ApiError && error.errors) {
    return error.errors;
  }

  return {};
}

function toFormValues(proyecto: Proyecto): ProyectoFormValues {
  return {
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    fechaLimite: proyecto.fechaLimite ?? "",
    estado: proyecto.estado
  };
}

function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProyectoFormValues>(
    createEmptyProyectoFormValues()
  );
  const [formErrors, setFormErrors] = useState<ProyectoValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<ProyectoFormValues>(
    createEmptyProyectoFormValues()
  );
  const [editingErrors, setEditingErrors] = useState<ProyectoValidationErrors>({});

  useEffect(() => {
    const loadProyectos = async () => {
      try {
        setIsLoading(true);
        setPageError(null);
        const response = await listProyectos();
        setProyectos(response);
      } catch (error) {
        setPageError(
          getErrorMessage(error, "No se pudieron cargar los proyectos.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProyectos();
  }, []);

  const handleCreateChange = (field: keyof ProyectoFormValues, value: string) => {
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

  const handleEditChange = (field: keyof ProyectoFormValues, value: string) => {
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
    const nextErrors = validateProyectoForm(formValues);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    try {
      setIsCreating(true);
      setFormErrors({});
      setFormMessage(null);
      const createdProyecto = await createProyecto(toProyectoPayload(formValues));

      setProyectos((currentProyectos) => [...currentProyectos, createdProyecto]);
      setFormValues(createEmptyProyectoFormValues());
      setFormMessage("Proyecto creado correctamente.");
    } catch (error) {
      setFormErrors(getValidationErrors(error));
      setFormMessage(
        getErrorMessage(error, "No se pudo crear el proyecto.")
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditStart = (proyecto: Proyecto) => {
    setEditingId(proyecto.id);
    setEditingValues(toFormValues(proyecto));
    setEditingErrors({});
    setPageError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValues(createEmptyProyectoFormValues());
    setEditingErrors({});
  };

  const handleEditSubmit = async (id: string) => {
    const nextErrors = validateProyectoForm(editingValues);

    if (Object.keys(nextErrors).length > 0) {
      setEditingErrors(nextErrors);
      return;
    }

    try {
      setSavingId(id);
      setEditingErrors({});
      setPageError(null);
      const updatedProyecto = await updateProyecto(id, toProyectoPayload(editingValues));

      setProyectos((currentProyectos) =>
        currentProyectos.map((proyecto) =>
          proyecto.id === id ? updatedProyecto : proyecto
        )
      );
      handleEditCancel();
    } catch (error) {
      setEditingErrors(getValidationErrors(error));
      setPageError(
        getErrorMessage(error, "No se pudo actualizar el proyecto.")
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (proyecto: Proyecto) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el proyecto "${proyecto.nombre}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(proyecto.id);
      setPageError(null);
      await deleteProyecto(proyecto.id);
      setProyectos((currentProyectos) =>
        currentProyectos.filter((item) => item.id !== proyecto.id)
      );

      if (editingId === proyecto.id) {
        handleEditCancel();
      }
    } catch (error) {
      setPageError(getErrorMessage(error, "No se pudo eliminar el proyecto."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="app-shell app-shell-projects">
      <section className="hero">
        <p className="eyebrow">ABM de proyectos</p>
        <h1>Gestor de proyectos</h1>
        <p className="hero-copy">
          Crea, edita y elimina proyectos en memoria para avanzar con la base del
          trabajo final.
        </p>
      </section>

      {(pageError || formMessage) && (
        <div className={`feedback-banner ${pageError ? "feedback-error" : "feedback-success"}`}>
          {pageError || formMessage}
        </div>
      )}

      <div className="content-grid">
        <ProyectoForm
          errors={formErrors}
          isSubmitting={isCreating}
          onChange={handleCreateChange}
          onSubmit={handleCreateSubmit}
          values={formValues}
        />

        <ProyectoTable
          deletingId={deletingId}
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
        />
      </div>
    </main>
  );
}

export default ProyectosPage;
