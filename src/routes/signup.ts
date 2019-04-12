import * as express from 'express';

const router = express.Router();

// Signup
router.get('/signup', (req, res) => res.render('pages/signup'));

module.exports = router;
