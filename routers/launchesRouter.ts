import { Router } from "../deps.ts";
import {
  getAllSpaceXLaunches,
  createOneSpaceXLaunch,
  getOneSpaceXLaunch,
  updateOneSpaceXLaunch,
  deleteOneSpaceXLaunch,
} from "../controllers/launchesController.ts";

const router = new Router();

router
  .get("/api/v1/launches", getAllSpaceXLaunches)
  .post("/api/v1/launches", createOneSpaceXLaunch)
  .get("/api/v1/launches/:id", getOneSpaceXLaunch)
  .patch("/api/v1/launches/:id", updateOneSpaceXLaunch)
  .delete("/api/v1/launches/:id", deleteOneSpaceXLaunch);

export default router;
