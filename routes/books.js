const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books');
const isLoggedIn = require('../middleware/isLoggedIn');

// Static or specific routes FIRST
router.get('/', isLoggedIn, booksController.listBooks);
router.get('/new', isLoggedIn, booksController.newBookForm);
router.get('/status/:status', isLoggedIn, booksController.getBooksByStatus);

// Then routes (with :id) 
router.get('/:id/edit', isLoggedIn, booksController.editBookForm);
router.get('/:id', isLoggedIn, booksController.showBook);
router.post('/', isLoggedIn, booksController.createBook);
router.put('/:id', isLoggedIn, booksController.updateBook);
router.delete('/:id', isLoggedIn, booksController.deleteBook);

module.exports = router;
