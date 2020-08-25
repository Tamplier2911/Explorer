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
  if (body.flightNumber) {
    if (!globalLaunchesState.has(body.flightNumber)) {
      globalLaunchesState.set(Number(body.flightNumber), body);
      const launch = globalLaunchesState.get(Number(body.flightNumber));
      ctx.response.body = launch;
      return;
    }
    ctx.response.body = {
      success: false,
      message: "Launch with this flight number already exist.",
    };
    return;
  }
  ctx.response.body = {
    success: false,
    message: "Something went wrong, please try again later.",
  };
};

export const getOneSpaceXLaunch = async (ctx: any) => {
  if (ctx.params && ctx.params.id) {
    const idAsNumber = Number(ctx.params.id);
    if (globalLaunchesState.has(idAsNumber)) {
      const launch = globalLaunchesState.get(idAsNumber);
      ctx.response.body = launch;
      return;
    }
    ctx.response.body = {
      success: false,
      message: "Launch with this flight number is not found.",
    };
  }
};

export const updateOneSpaceXLaunch = async (ctx: any) => {
  const bodyPromise = ctx.request.body({ type: "json" });
  const body = await bodyPromise.value;
  if (ctx.params && ctx.params.id) {
    const idAsNumber = Number(ctx.params.id);
    if (globalLaunchesState.has(idAsNumber)) {
      if (idAsNumber === body.flightNumber) {
        const requestedLaunch = globalLaunchesState.get(idAsNumber);
        globalLaunchesState.set(idAsNumber, { ...requestedLaunch, ...body });
        // globalLaunchesState.set(idAsNumber, body);
        const launch = globalLaunchesState.get(idAsNumber);
        ctx.response.body = launch;
        return;
      }
      ctx.response.body = {
        success: false,
        message: "You cannot change flight number.",
      };
      return;
    }
    ctx.response.body = {
      success: false,
      message: "Launch with this flight number is not found.",
    };
  }
};

export const deleteOneSpaceXLaunch = async (ctx: any) => {
  if (ctx.params && ctx.params.id) {
    const idAsNumber = Number(ctx.params.id);
    if (globalLaunchesState.has(idAsNumber)) {
      globalLaunchesState.delete(idAsNumber);
      ctx.response.body = "Success!";
      ctx.response.body = {
        success: true,
        message:
          `Launch with flight number ${idAsNumber} was successfuly deleted.`,
      };
      return;
    }
    ctx.response.body = {
      success: false,
      message: "Launch with this flight number is not found.",
    };
  }
};
