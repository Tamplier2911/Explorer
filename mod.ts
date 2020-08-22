import { Application, send } from "https://deno.land/x/oak/mod.ts";

// routers
import asciiRouter from "./routers/asciiRouter.ts";
import planetsRouter from "./routers/planetsRouter.ts";

const app = new Application();
const port = Number(Deno.env.get("PORT")) || 5000;

// console.log(Deno.cwd());
// console.log(import.meta.url);

// middleware
// ctx stands for context (contain app state)
app.use(async (ctx: any, next) => {
  await next();
  const { app, state, request, response, cookies } = ctx;
  const time = response.headers.get("X-Response-Time");
  console.log(
    `${request.method} -- ${time} -- ${request.url.origin}${request.url.pathname} --> ${
      request.secure ? "secure" : "insecure"
    }`,
  );
});

app.use(async (ctx: any, next) => {
  const { app, state, request, response, cookies } = ctx;
  const start = Date.now();
  await next();
  const end = Date.now() - start;
  response.headers.set("X-Response-Time", `${end}ms`);
});

// routes
app.use(asciiRouter.routes());
app.use(asciiRouter.allowedMethods());
app.use(planetsRouter.routes());
app.use(planetsRouter.allowedMethods());

// serving static assets
app.use(async (ctx) => {
  const filePath = ctx.request.url.pathname;
  const fileWhitelist = [
    "/",
    "/index.html",
    "/stylesheets/style.css",
    "/javascripts/script.js",
    "/images/favicon.png",
  ];

  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  }
});

// next is optional - no next means endpoint
// app.use((ctx: any) => {
//   const { app, state, request, response, cookies } = ctx;
//   response.body = "Hello, Deno!";
// });

if (import.meta.main) await app.listen({ port: port });

// $ deno run --allow-net --allow-read --allow-write --allow-env mod.ts
