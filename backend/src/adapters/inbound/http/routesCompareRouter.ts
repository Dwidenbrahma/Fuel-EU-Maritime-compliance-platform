import { Router } from "express";
import { makeGetComparison } from "../../../core/application/routes/getComparison";
import { RouteRepositoryPrisma } from "../../outbound/postgres/routeRepositoryPrisma";

export function createCompareRouter() {
  const router = Router();
  const repo = new RouteRepositoryPrisma();
  const getComparison = makeGetComparison(repo);

  router.get("/comparison", async (req, res) => {
    try {
      const data = await getComparison();
      res.json(data);
    } catch (err) {
      console.error("Error computing comparison:", err);
      res.status(500).json({ error: "Failed to compute comparison results" });
    }
  });

  return router;
}
