import { Router } from "express";
import { getAllCheckins, getCheckinById, updateCheckinStatus } from "./checkin.controller";

const router = Router();

router.get("/", getAllCheckins);
router.get("/:id", getCheckinById);
router.patch("/:id/status", updateCheckinStatus);

export default router;