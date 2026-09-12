import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import path from "path";
import fs from "fs";

app.use("/api", router);

// Serve static frontend assets if built
const frontendDistCandidates = [
  path.resolve(process.cwd(), "artifacts/future-card/dist/public"),
  path.resolve(process.cwd(), "dist/public"),
];
const distPath = frontendDistCandidates.find((dir) => fs.existsSync(dir));

if (distPath) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
}

export default app;
