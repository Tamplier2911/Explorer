import { Router } from "../deps.ts";
import { getExoplanets } from "../controllers/planetsController.ts";

const router = new Router();

router
  .get("/api/v1/planets", getExoplanets);

export default router;
