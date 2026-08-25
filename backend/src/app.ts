import cors from "cors";
import express from "express";
import { proyectoRoutes } from "./routes/proyectoRoutes.js";

function createApp() {
  const app = express();
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const allowedOrigins = new Set([frontendOrigin, "http://127.0.0.1:5173"]);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origen no permitido por CORS"));
      }
    })
  );
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/proyectos", proyectoRoutes);

  return app;
}

export { createApp };
