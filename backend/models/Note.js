// models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    content: String,
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
