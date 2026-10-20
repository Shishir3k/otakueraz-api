import worker from "../index.js";

export default async function handler(req) {
  const protocol =
    req.headers["x-forwarded-proto"] ||
    (req.connection?.encrypted ? "https" : "http");

  const host =
    req.headers["x-forwarded-host"] ||
    req.headers.host ||
    "localhost";

  const url = new URL(req.url, `${protocol}://${host}`);

  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : req.body
          ? JSON.stringify(req.body)
          : undefined,
  });

  const response = await worker.fetch(request, {
    API_VERSION: "2.3",
  });

  const body = await response.arrayBuffer();

  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return new Response(body, {
    status: response.status,
    headers,
  });
}