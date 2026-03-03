
import express from "express";
import { createNote, getNotes ,deleteNotes} from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.delete("/",authMiddleware,deleteNotes);

export default router;
