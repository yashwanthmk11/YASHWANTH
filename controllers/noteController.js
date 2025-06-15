const Note = require('../models/noteModel');

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { text } = req.body;
    const newNote = new Note({ text });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(id, { text }, { new: true });
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const toggleNoteDone = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    note.done = !note.done;
    const updated = await note.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  toggleNoteDone,
};