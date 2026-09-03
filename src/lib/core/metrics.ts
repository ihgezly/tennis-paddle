import { logger } from "./logger";

export function trackMetric(name: string, value = 1, tags?: Record<string, string>) {
  logger.info({ metric: name, value, tags });
}

export function trackDuration(name: string, durationMs: number, tags?: Record<string, string>) {
  logger.info({ metric: name, durationMs, tags });
}
