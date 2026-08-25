import { Router } from "express";
import { getDashboardResumen } from "../services/dashboardService.js";

const dashboardRoutes = Router();

dashboardRoutes.get("/resumen", (_request, response) => {
  response.json(getDashboardResumen());
});

export { dashboardRoutes };
