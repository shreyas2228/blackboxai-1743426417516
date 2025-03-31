const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Home page route
router.get('/', (req, res) => {
  res.render('pages/home', { 
    title: 'Moment Crafters - Wedding Planning',
    content: 'home',
    categories: [
      {name: 'Photographers', slug: 'photographers', icon: 'camera'},
      {name: 'Venues', slug: 'venues', icon: 'map-marker'},
      {name: 'Caterers', slug: 'caterers', icon: 'utensils'},
      {name: 'Florists', slug: 'florists', icon: 'spa'}
    ]
  });
});

// About page route
router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us' });
});

module.exports = router;