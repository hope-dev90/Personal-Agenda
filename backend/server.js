import "dotenv/config"; // dotenv
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import debugLib from "debug";
import config from "config";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import connectDB from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import { loginUser, registerUser } from "./controllers/userController.js";

const debug = debugLib("app:server");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

await connectDB();

app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("Agenda backend is running!"));

const PORT = process.env.PORT || 4400;
app.listen(PORT, () => {
  debug(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
