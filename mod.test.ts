import {
  assertEquals,
  assertNotEquals,
} from "./deps_dev.ts";

// short syntax
Deno.test("short test example", () => {
  assertEquals({}, {});
  assertNotEquals({ a: 1 }, { a: 2 });
  console.log("Hello, from Deno test short.");
});

// long syntax
Deno.test({
  name: "example test",
  ignore: Deno.build.os === "windows" ? false : true,
  // check that number of async completed ops are same as number of dispatched
  sanitizeOps: true,
  // ensure test does not leak resources
  sanitizeResources: true,
  fn() {
    assertEquals(2, 2);
    assertNotEquals("deno", "node");
    console.log("Hello, from Deno test long.");
  },
});

// test file open
Deno.test("open text file", async () => {
  const file = await Deno.readTextFile("./README.md");
  console.log(file);
});

// deno test --allow-read
