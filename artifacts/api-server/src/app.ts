import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import * as pinoHttpPkg from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

// pino-http may be default or named export depending on the env
const pinoHttp = (pinoHttpPkg as any).default ?? pinoHttpPkg;

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve static frontend assets if built
const frontendDistCandidates = [
  path.resolve(process.cwd(), "artifacts/future-card/dist/public"),
  path.resolve(process.cwd(), "dist/public"),
];
const distPath = frontendDistCandidates.find((dir) => fs.existsSync(dir));

if (distPath) {
  app.use(express.static(distPath));
  app.use((req: any, res: any, next: any) => {
    if (
      (req.method === "GET" || req.method === "HEAD") &&
      !String(req.path ?? req.url ?? "").startsWith("/api")
    ) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
}

export default app;
