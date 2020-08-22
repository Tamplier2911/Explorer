import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { parse } from "https://deno.land/std/encoding/csv.ts";

const parseCSV = async (path: string) => {
  try {
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
  } catch (err) {
    console.log("Parse CSV: ", err.message);
    console.log(path);
  }
};

export default parseCSV;
