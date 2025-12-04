import express from "express";
import { RouteRepository } from "../../../core/ports/routeRepository";
import { makeFetchRoutes } from "../../../core/application/routes/fetchRoutes";
import { makeSetBaseline } from "../../../core/application/routes/setBaseline";
import { makeGetComparison } from "../../../core/application/routes/getComparison";

export default function makeRoutesRouter(routeRepo: RouteRepository) {
  const router = express.Router();
  const fetchRoutes = makeFetchRoutes(routeRepo);
  const setBaseline = makeSetBaseline(routeRepo);
  const getComparison = makeGetComparison(routeRepo);

  router.get("/", async (req, res) => {
    const data = await fetchRoutes();
    res.json(data);
  });

  router.post("/:routeId/baseline", async (req, res) => {
    try {
      await setBaseline(req.params.routeId);
      res.status(204).send(null);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get("/comparison", async (req, res) => {
    const data = await getComparison();
    res.json(data);
  });

  return router;
}
