import { join } from "https://deno.land/std/path/mod.ts";
import parseCSV from "../utils/parseCSV.ts";

export const getExoplanets = async (ctx: any) => {
  // get csv path
  const csvPath = join(`${Deno.cwd()}`, "data", "kepler_exoplanets_nasa.csv");

  // parse csv data
  const rawExpolanets = await parseCSV(csvPath);

  // define planet interface
  interface Planet {
    [key: string]: string;
  }

  // type Planet = Record<string, string>;

  // filter raw data to get all planets with most chance to candidate to live
  const livablePlanets = (rawExpolanets as Array<Planet>).filter((planet) => {
    // either CANDIDATE or FALSE POSITIVE
    const disposition = planet.koi_pdisposition;
    // must be between 0.5 and 1.5
    const radius = parseFloat(planet.koi_prad);
    // must be between 0.78 and 1.04
    const starMass = parseFloat(planet.koi_smass);
    // must be between 0.99 and 1.01
    const starRadius = parseFloat(planet.koi_srad);
    if (
      (disposition === "CANDIDATE") &&
      (radius >= 0.5 && radius <= 1.5) &&
      (starMass >= 0.78 && starMass <= 1.04) &&
      (starRadius >= 0.99 && starRadius <= 1.01)
    ) {
      return true;
    }
  });

  // filter certain fields from livable planets
  const parsedExpoPlanets = livablePlanets.map((planet) => {
    return {
      kepoi_name: planet.kepoi_name,
      koi_pdisposition: planet.koi_pdisposition,
      koi_prad: planet.koi_prad,
      koi_smass: planet.koi_smass,
      koi_srad: planet.koi_srad,
    };
  });

  // send parsed exo planets
  ctx.response.body = parsedExpoPlanets;
};
