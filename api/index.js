import worker from "../index.js";

export const config = {
  runtime: "nodejs20.x"
};

export default async function handler(req, res) {
  const host = req.headers.host || "localhost";

  const protocol =
    req.headers["x-forwarded-proto"] || "https";

  const url = new URL(
    req.url || "/",
    `${protocol}://${host}`
  );

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const body =
    chunks.length
      ? Buffer.concat(chunks)
      : undefined;

  const request = new Request(url, {
    method: req.method,

    headers: new Headers(req.headers),

    body:
      req.method === "GET" ||
      req.method === "HEAD"
        ? undefined
        : body,

    duplex: "half",
  });

  const response = await worker.fetch(
    request,
    {
      API_VERSION: "2.3"
    }
  );

  res.statusCode = response.status;

  for (const [key, value] of response.headers) {
    res.setHeader(key, value);
  }

  const responseBody =
    await response.arrayBuffer();

  res.end(
    Buffer.from(responseBody)
  );
}