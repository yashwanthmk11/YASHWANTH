const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  toggleNoteDone,
} = require('../controllers/noteController');

router.get('/', getAllNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/toggle', toggleNoteDone);

module.exports = router;
