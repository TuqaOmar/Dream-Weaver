import app from "./app.js";
import { logger } from "./lib/logger.js";

if (!process.env.VERCEL) {
  const rawPort = process.env["PORT"] || "8080";
  const port = Number(rawPort) > 0 ? Number(rawPort) : 8080;

  app.listen(port, (err: any) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

export default app;
