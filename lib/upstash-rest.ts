export type RedisArgument = string | number;

type UpstashResponse<T> = {
  result?: T;
  error?: string;
};

function getConfiguration() {
  const url = (
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  )?.replace(/\/$/, "");
  const token =
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Upstash KV REST API is not configured");
  }

  return { url, token };
}

export function isUpstashConfigured() {
  return Boolean(
    (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) &&
      (process.env.KV_REST_API_TOKEN ??
        process.env.UPSTASH_REDIS_REST_TOKEN),
  );
}

async function request<T>(path: string, body: RedisArgument[][] | RedisArgument[]) {
  const { url, token } = getConfiguration();
  const response = await fetch(url + path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json()) as UpstashResponse<T> | UpstashResponse<T>[];

  if (!response.ok) {
    const message = Array.isArray(payload) ? payload[0]?.error : payload.error;
    throw new Error(message ?? "Upstash request failed");
  }

  return payload;
}

export async function redisCommand<T>(command: RedisArgument[]) {
  const payload = (await request<T>("", command)) as UpstashResponse<T>;
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
}

export async function redisTransaction(commands: RedisArgument[][]) {
  const payload = (await request<unknown>("/multi-exec", commands)) as UpstashResponse<unknown>[];
  const failed = payload.find((item) => item.error);
  if (failed?.error) throw new Error(failed.error);
  return payload.map((item) => item.result);
}
