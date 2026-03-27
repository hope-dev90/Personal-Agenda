
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
  const notes = await Note.find({ user: req.user._id });
  res.json(notes);
};
 export const deleteNotes = async (req,res)=>{
  const notes = await Note.deleteOne({ user: req.user._id });
  res.json("deleted successfully")
 };