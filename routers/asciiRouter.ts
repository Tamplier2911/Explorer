import { Router } from "https://deno.land/x/oak/mod.ts";
import { asciiArt } from "../controllers/asciiController.ts";

const router = new Router();

router
  .get("/ascii", asciiArt);

export default router;
