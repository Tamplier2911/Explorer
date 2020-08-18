import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const port = Number(Deno.env.get("PORT")) || 5000;

// middleware
// ctx stands for context (contain app state)
app.use(async (ctx: any, next) => {
  await next();
  const { app, state, request, response, cookies } = ctx;
  const time = response.headers.get("X-Response-Time");
  console.log(
    `${request.method} -- ${time} -- ${request.url.origin} -- ${
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

// next is optional - no next means endpoint
app.use((ctx: any) => {
  const { app, state, request, response, cookies } = ctx;
  response.body = "Hello, Deno!";
});

if (import.meta.main) await app.listen({ port: port });

// $ deno run --allow-net --allow-env  mod.ts
