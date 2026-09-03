import { logger } from "./logger";

type AlertRule = {
  metric: string;
  threshold: number;
  comparison: "gt" | "lt" | "eq";
  severity: "critical" | "warning" | "info";
};

const RULES: AlertRule[] = [
  { metric: "payment_failure_rate", threshold: 10, comparison: "gt", severity: "critical" },
  { metric: "checkout_5xx_rate", threshold: 5, comparison: "gt", severity: "critical" },
  { metric: "inventory_negative", threshold: 0, comparison: "gt", severity: "critical" },
  { metric: "webhook_failure_rate", threshold: 5, comparison: "gt", severity: "warning" },
  { metric: "db_connection_failures", threshold: 3, comparison: "gt", severity: "critical" },
];

export function evaluateAlerts(metrics: Record<string, number>) {
  const triggered = [];
  for (const rule of RULES) {
    const value = metrics[rule.metric];
    if (value === undefined) continue;
    const shouldTrigger =
      rule.comparison === "gt" ? value > rule.threshold :
      rule.comparison === "lt" ? value < rule.threshold :
      value === rule.threshold;
    if (shouldTrigger) {
      triggered.push({ ...rule, currentValue: value });
      logger.error({ alert: rule.metric, threshold: rule.threshold, actual: value, severity: rule.severity });
    }
  }
  return triggered;
}
