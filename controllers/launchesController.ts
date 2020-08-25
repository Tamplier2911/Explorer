// get space x launches dates
const res = await fetch(
  "https://api.spacexdata.com/v3/launches",
  { method: "GET" },
);

// if not successful - throw error
if (!res.ok) throw new Error("Request response with status FAIL.");

// else parse recieved data
const launchesResponseData = await res.json();

// define required interfeces for data parsing
interface Launch {
  flightNumber: number;
  mission: string;
  rocket: string;
  launchDate: number;
  upcoming: boolean;
  success?: boolean;
  target?: string;
  customers: [string];
}

interface Payloads {
  customers: [string];
}

interface SecondStage {
  payloads: [Payloads];
}

interface Rocket {
  rocket_name: string;
  second_stage: SecondStage;
}

interface Launches {
  flight_number: string;
  mission_name: string;
  rocket: Rocket;
  launch_date_unix: number;
  upcoming: boolean;
  launch_success: boolean;
}

// create new map
// const launches = new Map<number, Launch>();
const globalLaunchesState = new Map<number, Launch>();

// fill map with required data
(launchesResponseData as Array<Launches>).forEach((launch) => {
  const payloads = launch.rocket.second_stage.payloads;
  const customers: any = [];
  payloads.forEach((payload) => customers.push(...payload.customers));

  globalLaunchesState.set(Number(launch.flight_number), {
    flightNumber: Number(launch.flight_number),
    mission: launch.mission_name,
    rocket: launch.rocket.rocket_name,
    launchDate: launch.launch_date_unix,
    upcoming: launch.upcoming,
    success: launch.launch_success,
    customers: customers,
  });
});

export const getAllSpaceXLaunches = async (ctx: any) => {
  // convert map to array and expose
  ctx.response.body = [...globalLaunchesState.values()];
};

export const createOneSpaceXLaunch = async (ctx: any) => {
  const bodyPromise = ctx.request.body({ type: "json" });
  const body = await bodyPromise.value;
  if (body.id) {
    globalLaunchesState.set(Number(body.id), body);
    const launch = globalLaunchesState.get(Number(body.id));
    ctx.response.body = launch;
    return;
  }
  ctx.response.body = "Something went wrong, please try again later.";
};

export const getOneSpaceXLaunch = async (ctx: any) => {
  if (ctx.params && ctx.params.id) {
    if (globalLaunchesState.has(Number(ctx.params.id))) {
      const launch = globalLaunchesState.get(Number(ctx.params.id));
      ctx.response.body = launch;
      return;
    }
    ctx.response.body = "Launch with that ID is not found.";
  }
};

export const updateOneSpaceXLaunch = async (ctx: any) => {
  const bodyPromise = ctx.request.body({ type: "json" });
  const body = await bodyPromise.value;
  if (ctx.params && ctx.params.id) {
    if (globalLaunchesState.has(Number(ctx.params.id))) {
      globalLaunchesState.set(Number(ctx.params.id), body);
      const launch = globalLaunchesState.get(Number(ctx.params.id));
      ctx.response.body = launch;
      return;
    }
    ctx.response.body = "Launch with that ID is not found.";
  }
};

export const deleteOneSpaceXLaunch = async (ctx: any) => {
  if (ctx.params && ctx.params.id) {
    if (globalLaunchesState.has(Number(ctx.params.id))) {
      globalLaunchesState.delete(Number(ctx.params.id));
      ctx.response.body = "Success!";
      return;
    }
    ctx.response.body = "Launch with that ID is not found.";
  }
};
