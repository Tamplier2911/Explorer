import { BufReader } from "../deps.ts";
import { parse } from "../deps.ts";

const parseCSV = async (path: string) => {
  // using Deno.open premitive to parse csv file
  const file = await Deno.open(path, { read: true, write: true });

  // create buffer reader
  const bufReader = new BufReader(file);

  // parse buffer reader
  const result = await parse(bufReader, {
    header: true,
    comment: "#",
  });

  // close file resource id
  Deno.close(file.rid);

  // return data
  return result;
};

export default parseCSV;
