// controllers/noteController.js
import Note from "../models/Note.js";

// CREATE NOTE (saved to logged-in user)
export const createNote = async (req, res) => {
  const { title, content } = req.body;

  const note = await Note.create({
    user: req.user._id, // 👈 THIS binds note to user
    title,
    content,
  });

  res.status(201).json(note);
};

// GET NOTES (ONLY for logged-in user)
export const getNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user._id });
  res.json(notes);
};
