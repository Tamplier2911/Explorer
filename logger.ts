// standart logger
import * as log from "https://deno.land/std/log/mod.ts";

// logger setup
const setupLogger = async () => {
  await log.setup({
    handlers: {
      // log everything from debug and forward DEBUG -> INFO -> WARNIG -> ERROR
      console: new log.handlers.ConsoleHandler("DEBUG"),
      // but write into the file only WARNING and forward WARNING -> ERROR
      file: new log.handlers.FileHandler("WARNING", {
        filename: "./log.txt",
        formatter: "{levelName} {msg}",
      }),
    },

    loggers: {
      // default logger
      default: {
        // starts from debug level
        level: "DEBUG",
        // applies both console and file actions
        handlers: ["console", "file"],
      },
      /* 
      // error logger
      error: {
        // starts from error level
        level: "ERROR",
        // applies both console and file actions
        handlers: ["console", "file"],
      },
      */
    },
  });

  // get default logger
  const logger = log.getLogger();
  //   const errorLogger = log.getLogger("error");

  return logger;
};

export default setupLogger;
