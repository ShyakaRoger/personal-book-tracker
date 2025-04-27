const Book = require('../models/Book');

module.exports = {
  // List all books for the current user
  listBooks: async (req, res) => {
    try {
      const books = await Book.find({ user: req.session.user.id }).sort({ createdAt: -1 });
      res.render('books/index', {
        title: 'My Books',
        books,
        currentStatus: undefined
      });
    } catch (err) {
      console.error('Error fetching books:', err);
      res.redirect('/');
    }
  },

  // Show form to create new book
  newBookForm: (req, res) => {
    res.render('books/new', { 
      title: 'Add New Book',
      book: {} // Empty book object for the form
    });
  },

  // Create new book
  createBook: async (req, res) => {
    try {
      if (!req.session.user || !req.session.user.id) {
        throw new Error('No user session found');
      }
  
      const { title, author, description, status } = req.body;
  
      const newBook = new Book({
        title,
        author,
        description,
        status,
        user: req.session.user.id
      });
  
      await newBook.save();
      res.redirect('/books');
    } catch (err) {
      console.error('Error saving book:', err);
      res.render('books/new', {
        title: 'Add Book',
        error: 'Failed to add book. Please check your inputs.',
        book: req.body
      });
    }
  },

  // Show single book
  showBook: async (req, res) => {
    try {
      const book = await Book.findOne({ 
        _id: req.params.id,
        user: req.session.user.id  // Changed from _id to id
      });

      if (!book) return res.redirect('/books');

      res.render('books/show', { 
        title: book.title,
        book
      });
    } catch (err) {
      console.error(err);
      res.redirect('/books');
    }
  },

  // Show form to edit book
  editBookForm: async (req, res) => {
    try {
      const book = await Book.findOne({
        _id: req.params.id,
        user: req.session.user.id  // Changed from _id to id
      });

      if (!book) return res.redirect('/books');

      res.render('books/edit', {
        title: 'Edit Book',
        book
      });
    } catch (err) {
      console.error(err);
      res.redirect('/books');
    }
  },

  // Update Book
  updateBook: async (req, res) => {
    try {
      const { title, author, description, status } = req.body;

      await Book.findOneAndUpdate(
        { _id: req.params.id, user: req.session.user.id },  // Changed from _id to id
        { title, author, description, status },
        { new: true }
      );

      res.redirect(`/books/${req.params.id}`);
    } catch (err) {
      console.error(err);
      res.redirect('/books');
    }
  },

  // Delete Book
  deleteBook: async (req, res) => {
    try {
      await Book.findOneAndDelete({
        _id: req.params.id,
        user: req.session.user.id  // Changed from _id to id
      });
      res.redirect('/books');
    } catch (err) {
      console.error(err);
      res.redirect('/books');
    }
  },

  // selecting the status of books
  getBooksByStatus: async (req, res) => {
    try {
      const validStatuses = ['to-read', 'reading', 'completed'];
      const status = req.params.status;

      if (!validStatuses.includes(status)) {
        return res.redirect('/books');
      }

      const books = await Book.find({ 
        user: req.session.user.id,  // Changed from _id to id
        status
      }).sort({ createdAt: -1 });

      res.render('books/index', {
        title: `My Books - ${status.replace('-', ' ')}`,
        books,
        currentStatus: status
      });
    } catch (err) {
      console.error(err);
      res.redirect('/books');
    }
  }
};