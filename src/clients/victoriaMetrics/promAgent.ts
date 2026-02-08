import promClient from 'prom-client';
import { sendToDiscordAdmins } from '../discord';

const MAX_PUSH_METRICS_ERRORS = 5;
const FORGET_ERROR_TIME_THRESHOLD = 60 * 60 * 1000; // 1 hour

export class PromAgent {
  private metricNames = new Set<string>();
  private pushMetricsErrorsTimestamps: number[] = [];
  private readonly dupeMetricErrorHandler: (metricName: string) => void;

  constructor(dupeMetricErrorHandler: (metricName: string) => void) {
    this.dupeMetricErrorHandler = dupeMetricErrorHandler;
  }

  public registerMetric(metricName: string) {
    this.metricNames.has(metricName)
      ? this.dupeMetricErrorHandler(metricName)
      : this.metricNames.add(metricName);
  }

  public async pushMetrics() {
    let metrics: string;

    try {
      metrics = await promClient.register.metrics(); // Will call any collect() functions for gauges
    } catch (e) {
      // Exit program if non-initialised labels are used in collect() function
      if (e.message.includes('label')) {
        sendToDiscordAdmins(e.message);
        console.error(e);
        process.exit(1);
      }

      throw e;
    }

if (!process.env.VM_IMPORT_PROMETHEUS_URL) {
  if (process.env.ENV !== 'prod') return;
  console.error(`Missing environment variable: VM_IMPORT_PROMETHEUS_URL`);
  return;
}


let response: Response;
try {
  response = await fetch(process.env.VM_IMPORT_PROMETHEUS_URL, {
    method: 'POST',
    body: metrics,
    headers: { 'Content-Type': 'text/plain' },
  });
} catch (e: any) {
  // In local/dev this is not actionable; avoid crashing / unhandled rejection loops.
  if (process.env.ENV !== 'prod') {
    console.error(`[metrics] pushMetrics failed: ${e?.message ?? e}`);
    return;
  }

  // In prod, log and continue (crashing the game server over metrics is rarely worth it).
  console.error(`[metrics] pushMetrics failed (prod):`, e);
  return;
}


    if (!response.ok) {
      const errMsg = `Failed to push metrics: status=${response.status} text=${response.statusText}`;
      console.error(errMsg);

      // Alert Discord while errors are less than MAX_PUSH_METRICS_ERRORS
      const now = Date.now();
      this.pushMetricsErrorsTimestamps.push(now);

      while (this.pushMetricsErrorsTimestamps.length > 0) {
        const timeDiff = now - this.pushMetricsErrorsTimestamps[0];

        if (timeDiff > FORGET_ERROR_TIME_THRESHOLD) {
          this.pushMetricsErrorsTimestamps.unshift();
        } else {
          break;
        }
      }

      if (this.pushMetricsErrorsTimestamps.length <= MAX_PUSH_METRICS_ERRORS) {
        sendToDiscordAdmins(errMsg);
      }
    }
  }
}

const dupeMetricErrorHandler = (metricName: string) => {
  const errMsg = `Error metric name already exists: ${metricName}`;
  sendToDiscordAdmins(errMsg);
  console.error(errMsg);
  if (process.env.ENV === 'prod') process.exit(1);
};


export const promAgent = new PromAgent(dupeMetricErrorHandler);
