import { Router } from "express";
import healthRouter from "./health.js";
import cardsRouter from "./cards.js";
import uploadRouter from "./upload.js";

const router = Router();

router.use(healthRouter);
router.use(cardsRouter);
router.use(uploadRouter);

export default router;
