const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');

router.use(protect, authorize('student'));

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:foodId', removeFavorite);
router.get('/check/:foodId', checkFavorite);

module.exports = router;
