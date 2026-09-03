import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: ["password", "token", "secret", "authorization"],
  base: { app: "Ace Gear Store", env: process.env.NODE_ENV },
  ...(process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : {}),
});
