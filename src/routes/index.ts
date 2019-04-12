import * as express from 'express';

const router = express.Router();

// Index
router.get('/', (req, res) => {
	const drinks = [
		{ name: 'Bloody Mary', drunkness: 3 },
		{ name: 'Martini', drunkness: 5 },
		{ name: 'Scotch', drunkness: 10 }
	];

	const tagline = 'Any code of your own that you haven\'t looked at for six or more months might as well have been written by someone else.';

	res.render('pages/index', { drinks: drinks, tagline: tagline });
});

module.exports = router;
