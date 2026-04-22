import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

const allowedFiles = new Set(["01.mp4", "02.mp4", "03.mp4", "04.mp4"]);

type RouteContext = {
  params: Promise<{
    fileName: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { fileName } = await context.params;

  if (!allowedFiles.has(fileName)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "assets", fileName);
  const fileStats = await stat(filePath);
  const rangeHeader = request.headers.get("range");

  if (!rangeHeader) {
    return new Response(createReadStream(filePath) as unknown as BodyInit, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileStats.size),
        "Content-Type": "video/mp4"
      }
    });
  }

  const matches = /bytes=(\d*)-(\d*)/.exec(rangeHeader);

  if (!matches) {
    return new Response("Invalid range", { status: 416 });
  }

  const start = matches[1] ? Number(matches[1]) : 0;
  const end = matches[2] ? Number(matches[2]) : fileStats.size - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileStats.size) {
    return new Response("Range not satisfiable", {
      status: 416,
      headers: {
        "Content-Range": `bytes */${fileStats.size}`
      }
    });
  }

  const chunkSize = end - start + 1;

  return new Response(createReadStream(filePath, { start, end }) as unknown as BodyInit, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(chunkSize),
      "Content-Range": `bytes ${start}-${end}/${fileStats.size}`,
      "Content-Type": "video/mp4"
    }
  });
}