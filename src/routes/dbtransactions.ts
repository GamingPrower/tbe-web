import * as express from 'express';
import * as mysql from 'mysql';
import * as url from 'url';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import { dbPass } from '../config/config';
import { bin2hex, hex2bin, newUserEmail } from '../modules/utils';

const router = express.Router();

// Configure DB
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: dbPass,
	database: 'loginsystem'
});

// Todo
router.get('/todo', (req, res) => {
	if (!(req.session as Express.Session).isLoggedIn) return res.redirect(url.format({ pathname: '/signup' }));

	connection.query('SELECT id, name, done FROM items WHERE user=?', [(req.session as Express.Session).uid], (err, results, fields) => {
		if (err) return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));

		res.render('pages/todo', { items: results });
	});
});

// Mark Item
router.get('/mark', (req, res) => {
	const as = req.query.as as string;
	const item = req.query.item as string;

	if (as === 'done') {
		connection.query('UPDATE items SET done = 1 WHERE id = ? AND user = ?', [item, (req.session as Express.Session).uid], (err, results, fields) => {
			if (err) return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));
			res.redirect(url.format({ pathname: '/todo' }));
		});
	} else if (as === 'notdone') {
		connection.query('UPDATE items SET done = 0 WHERE id = ? AND user = ?', [item, (req.session as Express.Session).uid], (err, results, fields) => {
			if (err) return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));
			res.redirect(url.format({ pathname: '/todo' }));
		});
	}
});

// Remove Item
router.get('/remove', (req, res) => {
	const as = req.query.as as string;
	const item = req.query.item as string;

	if (as !== 'remove') return res.redirect(url.format({ pathname: '/todo' }));

	connection.query('DELETE FROM items WHERE id = ? AND user = ?', [item, (req.session as Express.Session).uid], (err, results, fields) => {
		if (err) return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));
		res.redirect(url.format({ pathname: '/todo' }));
	});
});

// Reset Password
router.post('/reset', (req, res) => {
	if (!req.body.email) return res.redirect(url.format({ pathname: '/signup' }));

	const email = req.body.email as string;
	const selector = crypto.randomBytes(8).toString('hex');
	const token = hex2bin(crypto.randomBytes(32).toString('hex')).result as string;

	const uri = `localhost:5000/createnewpassword?selector=${selector}&validator=${(bin2hex(token).result as string).toLowerCase()}`;
	const expires = (Date.now() / 1000) + 900;

	connection.query('DELETE FROM pwdreset WHERE email = ?', [email], (err, results, fields) => {
		if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));

		bcrypt.hash(token, 10, async (err, encrypted) => {
			if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
			connection.query('INSERT INTO pwdreset (email, selector, token, expires) VALUES (?, ?, ?, ?)', [email, selector, encrypted, expires]);

			const subject = 'Password reset for TBE';
			let message = '<p>This is a password reset request. Click the link to reset your password. If you did not make this request, you can ignore this e-mail.</p>';
			message += '<p>Here is your password reset link: </br>';
			message += `<a href="${uri}">${uri}</a></p>`;

			await newUserEmail(email, subject, message);

			res.redirect(url.format({ pathname: '/signup', query: { reset: 'success' } }));
		});
	});
});

// Signup Submit
router.post('/signup-submit', (req, res) => {
	const username = req.body.uid as string;
	const email = req.body.mail as string;
	const password = req.body.pwd as string;
	const passwordRepeat = req.body.pwdrepeat as string;

	if (!username || !email || !password || !passwordRepeat) return res.redirect(url.format({ pathname: '/signup', query: { error: 'emptyfields', uid: username, mail: email } }));
	if (!email.match(/\S+@\S+\.\S+/) && !username.match(/^[a-zA-Z0-9]*$/)) return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidmailuid' } }));
	if (!email.match(/\S+@\S+\.\S+/)) return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidmail', uid: username } }));
	if (!username.match(/^[a-zA-Z0-9]*$/)) return res.redirect(url.format({ pathname: '/signup', query: { error: 'invaliduid', mail: email } }));
	if (password !== passwordRepeat) return res.redirect(url.format({ pathname: '/signup', query: { error: 'passwordcheck', uid: username, mail: email } }));

	connection.query('SELECT uid FROM users WHERE uid=?', [username], (err, results, fields) => {
		if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
		if (results.length > 0) return res.redirect(url.format({ pathname: '/signup', query: { error: 'usertaken', mail: email } }));

		bcrypt.hash(password, 10, (err, encrypted) => {
			if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
			connection.query('INSERT INTO users (uid, email, pwd) VALUES (?, ?, ?)', [username, email, encrypted], (err, results, fields) => {
				return res.redirect(url.format({ pathname: '/signup', query: { signup: 'success' } }));
			});
		});
	});
});

// Login Submit
router.post('/login-submit', (req, res) => {
	const username = req.body.uid as string;
	const password = req.body.pwd as string;

	if (!username || !password) return res.redirect(url.format({ pathname: '/signup', query: { error: 'emptyfields' } }));

	connection.query('SELECT * FROM users WHERE uid=?', [username], (err, results, fields) => {
		if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
		if (results.length < 1) return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidlogin' } }));

		bcrypt.compare(password, results[0].pwd, (err, same) => {
			if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
			if (!same) return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidlogin' } }));
			(req.session as Express.Session).isLoggedIn = true;
			(req.session as Express.Session).username = username;
			(req.session as Express.Session).uid = results[0].id;
			res.redirect(url.format({ pathname: '/todo', query: { login: 'success' } }));
		});
	});
});

// Create New Password
router.post('/resetpassword', (req, res) => {
	if (!req.body.pwd) return res.redirect(url.format({ pathname: '/signup', query: { newpwd: 'empty' } }));

	const password = req.body.pwd as string;
	const passwordRepeat = req.body.pwdrepeat as string;

	if (password !== passwordRepeat) return res.redirect(url.format({ pathname: '/signup', query: { newpwd: 'pwdnomatch' } }));

	const selector = req.body.selector;
	const validator = req.body.validator;

	const currentDate = Date.now() / 1000;

	connection.query('SELECT * FROM pwdreset WHERE selector=? AND expires >= ?', [selector, currentDate], (err, results, fields) => {
		if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
		if (results.length < 1 || results.length > 1) return res.redirect(url.format({ pathname: '/signup', query: { error: 'tokenexpired' } }));

		const tokenBin = hex2bin(validator).result;
		const tokenCheck = bcrypt.compareSync(tokenBin, results[0].token);

		if (!tokenCheck) return res.redirect(url.format({ pathname: '/signup', query: { error: 'autherror' } }));
		const tokenEmail = results[0].email;

		connection.query('SELECT * FROM users WHERE email=?;', [tokenEmail], (err, results, fields) => {
			if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
			if (results.length < 1 || results.length > 1) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));

			bcrypt.hash(password, 10, (err, encrypted) => {
				if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
				connection.query('UPDATE users SET pwd=? WHERE email=?', [encrypted, tokenEmail], (err, results, fields) => {
					if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));

					connection.query('DELETE FROM pwdreset WHERE email=?', [tokenEmail], (err, results, fields) => {
						res.redirect(url.format({ pathname: '/signup', query: { newpwd: 'passwordupdated' } }));
					});
				});
			});
		});
	});
});

// Logout
router.post('/logout', (req, res) => {
	(req.session as Express.Session).destroy(err => { if (err) console.error(err); });

	res.redirect(url.format({ pathname: '/signup' }));
});

// Add Item
router.post('/add', (req, res) => {
	const item = req.body.name as string;

	connection.query('INSERT INTO items (name, user, done, created) VALUES (?, ?, 0, NOW())', [item, (req.session as Express.Session).uid], (err, results, fields) => {
		if (err) return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
		res.redirect(url.format({ pathname: '/todo' }));
	});
});

module.exports = router;
