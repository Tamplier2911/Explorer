import { Router } from "https://deno.land/x/oak/mod.ts";
import { getExoplanets } from "../controllers/planetsController.ts";

const router = new Router();

router
  .get("/api/v1/planets", getExoplanets);

export default router;
