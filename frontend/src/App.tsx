import { useState } from "react";
import ProyectosPage from "./pages/ProyectosPage";
import TareasPage from "./pages/TareasPage";

function App() {
  const [activePage, setActivePage] = useState<"tareas" | "proyectos">("tareas");

  return (
    <div className="app-layout">
      <header className="top-nav">
        <div className="top-nav-inner">
          <span className="top-nav-title">Gestor de tareas por proyecto</span>
          <div className="top-nav-actions">
            <button
              className={`nav-button ${activePage === "tareas" ? "is-active" : ""}`}
              type="button"
              onClick={() => setActivePage("tareas")}
            >
              Tareas
            </button>
            <button
              className={`nav-button ${activePage === "proyectos" ? "is-active" : ""}`}
              type="button"
              onClick={() => setActivePage("proyectos")}
            >
              Proyectos
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        {activePage === "tareas" ? <TareasPage /> : <ProyectosPage />}
      </div>
    </div>
  );
}

export default App;
