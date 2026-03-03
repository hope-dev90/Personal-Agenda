import express from "express";
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  verifyEmail 
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;
