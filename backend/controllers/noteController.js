
import Note from "../models/Note.js";


export const createNote = async (req, res) => {
  const { title, content } = req.body;

  const note = await Note.create({
    user: req.user._id,
    title,
    content,
  });

  res.status(201).json(note);
};


export const getNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
};

export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, completed } = req.body;

  const note = await Note.findOne({ _id: id, user: req.user._id });

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (completed !== undefined) note.completed = completed;

  const updatedNote = await note.save();
  res.json(updatedNote);
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;

  const note = await Note.findOne({ _id: id, user: req.user._id });

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  await note.deleteOne();
  res.json({ message: "deleted successfully" });
};
