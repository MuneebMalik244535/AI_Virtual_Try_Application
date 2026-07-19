/**
 * Structured logger for the AI Fashion Stylist application.
 * Uses console output in development; emits JSON for log aggregation in production.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type EventType =
  | "http_request"
  | "http_response"
  | "ai_prompt"
  | "ai_response"
  | "recommendation"
  | "error"
  | "api_failure";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  event_type?: EventType;
  [key: string]: unknown;
}

export interface RequestLogContext {
  method: string;
  path: string;
  clientIp: string;
  userId?: string;
  [key: string]: unknown;
}

export interface AiPromptContext {
  model: string;
  prompt: string;
  promptTokens?: number;
  [key: string]: unknown;
}

export interface AiResponseContext {
  model: string;
  response: string;
  responseTokens?: number;
  responseTimeMs: number;
  [key: string]: unknown;
}

export interface RecommendationContext {
  userId: string;
  count: number;
  budget?: number;
  [key: string]: unknown;
}

export interface ApiFailureContext {
  apiName: string;
  error: string;
  statusCode?: number;
  [key: string]: unknown;
}

export interface ErrorContext {
  error: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDev =
  typeof process !== "undefined"
    ? process.env.NODE_ENV !== "production"
    : true;

class StructuredLogger {
  constructor(
    private readonly serviceName = "ai-fashion-stylist",
    private readonly minLevel: LogLevel = "info",
  ) {}

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private write(level: LogLevel, message: string, fields: Record<string, unknown> = {}): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...fields,
    };

    const output = isDev ? JSON.stringify(entry, null, 2) : JSON.stringify(entry);

    switch (level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, fields?: Record<string, unknown>): void {
    this.write("debug", message, fields);
  }

  info(message: string, fields?: Record<string, unknown>): void {
    this.write("info", message, fields);
  }

  warn(message: string, fields?: Record<string, unknown>): void {
    this.write("warn", message, fields);
  }

  error(message: string, fields?: Record<string, unknown>): void {
    this.write("error", message, { event_type: "error", ...fields });
  }

  logRequest(ctx: RequestLogContext): void {
    this.info("Incoming request", {
      event_type: "http_request",
      method: ctx.method,
      path: ctx.path,
      client_ip: ctx.clientIp,
      user_id: ctx.userId ?? "anonymous",
      ...omit(ctx, ["method", "path", "clientIp", "userId"]),
    });
  }

  logResponse(
    method: string,
    path: string,
    statusCode: number,
    responseTimeMs: number,
    fields?: Record<string, unknown>,
  ): void {
    this.info("Request completed", {
      event_type: "http_response",
      method,
      path,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      ...fields,
    });
  }

  logAiPrompt(ctx: AiPromptContext): void {
    const preview =
      ctx.prompt.length > 200 ? `${ctx.prompt.slice(0, 200)}...` : ctx.prompt;

    this.info("AI prompt sent", {
      event_type: "ai_prompt",
      model: ctx.model,
      prompt_length: ctx.prompt.length,
      prompt_tokens: ctx.promptTokens ?? estimateTokens(ctx.prompt),
      prompt_preview: preview,
      ...omit(ctx, ["model", "prompt", "promptTokens"]),
    });
  }

  logAiResponse(ctx: AiResponseContext): void {
    const preview =
      ctx.response.length > 200 ? `${ctx.response.slice(0, 200)}...` : ctx.response;

    this.info("AI response received", {
      event_type: "ai_response",
      model: ctx.model,
      response_length: ctx.response.length,
      response_tokens: ctx.responseTokens ?? estimateTokens(ctx.response),
      response_time_ms: ctx.responseTimeMs,
      response_preview: preview,
      ...omit(ctx, ["model", "response", "responseTokens", "responseTimeMs"]),
    });
  }

  logRecommendationCount(ctx: RecommendationContext): void {
    this.info("Recommendations generated", {
      event_type: "recommendation",
      user_id: ctx.userId,
      recommendation_count: ctx.count,
      budget: ctx.budget,
      ...omit(ctx, ["userId", "count", "budget"]),
    });
  }

  logApiFailure(ctx: ApiFailureContext): void {
    this.error("External API failure", {
      event_type: "api_failure",
      api_name: ctx.apiName,
      error: ctx.error,
      status_code: ctx.statusCode,
      ...omit(ctx, ["apiName", "error", "statusCode"]),
    });
  }
}

function estimateTokens(text: string): number {
  return Math.floor(text.replace(/\s+/g, " ").trim().length / 4);
}

function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export const logger = new StructuredLogger();

export { StructuredLogger };
