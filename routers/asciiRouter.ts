import { Router } from "../deps.ts";
import { asciiArt } from "../controllers/asciiController.ts";

const router = new Router();

router
  .get("/ascii", asciiArt);

export default router;
