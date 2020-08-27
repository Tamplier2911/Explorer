// oak
import { Application, send } from "./deps.ts";
import { flags } from "./deps.ts";

// routers
import asciiRouter from "./routers/asciiRouter.ts";
import planetsRouter from "./routers/planetsRouter.ts";
import launchesRouter from "./routers/launchesRouter.ts";

// logger
import logger from "./logger.ts";
// setup logger
const log = await logger();

const app = new Application();
// const port = Number(Deno.env.get("PORT")) || 5000;
const { args } = Deno;
const argsPort = flags.parse(args).port;
const port = Number(argsPort) || 5000;
// console.log(port);

// console.log(Deno.cwd());
// console.log(import.meta.url);

// oak error handler
app.addEventListener("error", (e) => {
  // Will log the thrown error to the console.
  // log.error(e.error);
  console.log(e.error);
});

// error handler
app.use(async (ctx: any, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = "Internal server error!";
    throw new Error(`${err.message}\n${err.stack}`);
  }
});

// middleware
// ctx stands for context (contain app state)
app.use(async (ctx: any, next) => {
  await next();
  const { app, state, request, response, cookies } = ctx;
  const time = response.headers.get("X-Response-Time");
  const today = new Date(Date.now());
  const currentMoment =
    `${today.getDate()}/${today.getMonth()}/${today.getFullYear()} -- ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}:${today.getMilliseconds()}`;
  log.info(
    `-- ${request.method} -- ${currentMoment} -- ${time} -- ${request.url.origin}${request.url.pathname} --> ${
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
app.use(launchesRouter.routes());
app.use(launchesRouter.allowedMethods());

// serving static assets
app.use(async (ctx) => {
  const filePath = ctx.request.url.pathname;
  const fileWhitelist = [
    "/",
    "/index.html",
    // "/stylesheets/style.css",
    "/css/styles.c9e67c45d5daceddadc4.css",
    // "/javascripts/script.js",
    "/js/main.f4a302c245bcbb6d83ea.js",
    "/images/favicon.png",
    "/images/earth-min-desk.jpg",
    "/images/earth-min-tablet.jpg",
    "/images/earth-min-mob.jpg",
    "/videos/earth-small-compressed-mp4.mp4",
    "/videos/earth-small-compressed-webm.webm",
    "/videos/earth-medium-compressed-mp4.mp4",
    "/videos/earth-medium-compressed-webm.webm",
    "/videos/earth-large-compressed-mp4.mp4",
    "/videos/earth-large-compressed-webm.webm",
  ];

  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
      gzip: true,
    });
  }
});

if (import.meta.main) {
  log.info(
    `HTTP server is up and listens for incoming requests at ${port}...`,
  );
  await app.listen({ port: port });
}

// normal bootstrap
// $ deno run --allow-net --allow-read --allow-write --allow-env --lock=lock.json mod.ts

// write lock file
// $ deno run --allow-net --allow-read --allow-write --allow-env --lock-write --lock=lock.json mod.ts
