import { Router } from "express";
import {
  sendRequest,
  getMyRequests,
  acceptRequest,
  rejectRequest,
} from "./chatRequest.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", sendRequest);
router.get("/", getMyRequests);
router.patch("/:id/accept", acceptRequest);
router.patch("/:id/reject", rejectRequest);

export default router;
