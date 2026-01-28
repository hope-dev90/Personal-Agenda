// routes/noteRoutes.js
import express from "express";
import { createNote, getNotes } from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);

export default router;
