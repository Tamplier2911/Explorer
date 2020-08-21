import { Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

router
  .get("/api/v1/planets", (ctx) => {})
  .post("/api/v1/planets", (ctx) => {})
  .get("/api/v1/planets/:id", (ctx) => {})
  .patch("/api/v1/planets/:id", (ctx) => {})
  .delete("/api/v1/planets/:id", (ctx) => {});
