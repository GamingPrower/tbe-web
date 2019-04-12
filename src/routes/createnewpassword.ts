import * as express from 'express';
import * as url from 'url';

const router = express.Router();

// Create New Password
router.get('/createnewpassword', (req, res) => {
	const selector = req.query.selector as string;
	const validator = req.query.validator as string;
	if (!selector || !validator) return res.redirect(url.format({ pathname: '/signup' }));

	res.render('pages/createnewpassword.ejs', { selector: selector, validator: validator });
});

module.exports = router;
