"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mysql = require("mysql");
const url = require("url");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const config_1 = require("../config/config");
const utils_1 = require("../modules/utils");
const router = express.Router();
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: config_1.dbPass,
    database: 'loginsystem'
});
router.get('/todo', (req, res) => {
    if (!req.session.isLoggedIn)
        return res.redirect(url.format({ pathname: '/signup' }));
    connection.query('SELECT id, name, done FROM items WHERE user=?', [req.session.uid], (err, results, fields) => {
        if (err)
            return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));
        res.render('pages/todo', { items: results });
    });
});
router.get('/mark', (req, res) => {
    const as = req.query.as;
    const item = req.query.item;
    if (as === 'done') {
        connection.query('UPDATE items SET done = 1 WHERE id = ? AND user = ?', [item, req.session.uid], (err, results, fields) => {
            if (err)
                return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));
            res.redirect(url.format({ pathname: '/todo' }));
        });
    }
    else if (as === 'notdone') {
        connection.query('UPDATE items SET done = 0 WHERE id = ? AND user = ?', [item, req.session.uid], (err, results, fields) => {
            if (err)
                return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));
            res.redirect(url.format({ pathname: '/todo' }));
        });
    }
});
router.get('/remove', (req, res) => {
    const as = req.query.as;
    const item = req.query.item;
    if (as !== 'remove')
        return res.redirect(url.format({ pathname: '/todo' }));
    connection.query('DELETE FROM items WHERE id = ? AND user = ?', [item, req.session.uid], (err, results, fields) => {
        if (err)
            return res.redirect(url.format({ pathname: '/todo', query: { error: 'dberror' } }));
        res.redirect(url.format({ pathname: '/todo' }));
    });
});
router.post('/reset', (req, res) => {
    if (!req.body.email)
        return res.redirect(url.format({ pathname: '/signup' }));
    const email = req.body.email;
    const selector = crypto.randomBytes(8).toString('hex');
    const token = utils_1.hex2bin(crypto.randomBytes(32).toString('hex')).result;
    const uri = `localhost:5000/createnewpassword?selector=${selector}&validator=${utils_1.bin2hex(token).result.toLowerCase()}`;
    const expires = (Date.now() / 1000) + 900;
    connection.query('DELETE FROM pwdreset WHERE email = ?', [email], (err, results, fields) => {
        if (err)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
        bcrypt.hash(token, 10, (err, encrypted) => __awaiter(this, void 0, void 0, function* () {
            if (err)
                return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
            connection.query('INSERT INTO pwdreset (email, selector, token, expires) VALUES (?, ?, ?, ?)', [email, selector, encrypted, expires]);
            const subject = 'Password reset for TBE';
            let message = '<p>This is a password reset request. Click the link to reset your password. If you did not make this request, you can ignore this e-mail.</p>';
            message += '<p>Here is your password reset link: </br>';
            message += `<a href="${uri}">${uri}</a></p>`;
            yield utils_1.newUserEmail(email, subject, message);
            res.redirect(url.format({ pathname: '/signup', query: { reset: 'success' } }));
        }));
    });
});
router.post('/signup-submit', (req, res) => {
    const username = req.body.uid;
    const email = req.body.mail;
    const password = req.body.pwd;
    const passwordRepeat = req.body.pwdrepeat;
    if (!username || !email || !password || !passwordRepeat)
        return res.redirect(url.format({ pathname: '/signup', query: { error: 'emptyfields', uid: username, mail: email } }));
    if (!email.match(/\S+@\S+\.\S+/) && !username.match(/^[a-zA-Z0-9]*$/))
        return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidmailuid' } }));
    if (!email.match(/\S+@\S+\.\S+/))
        return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidmail', uid: username } }));
    if (!username.match(/^[a-zA-Z0-9]*$/))
        return res.redirect(url.format({ pathname: '/signup', query: { error: 'invaliduid', mail: email } }));
    if (password !== passwordRepeat)
        return res.redirect(url.format({ pathname: '/signup', query: { error: 'passwordcheck', uid: username, mail: email } }));
    connection.query('SELECT uid FROM users WHERE uid=?', [username], (err, results, fields) => {
        if (err)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
        if (results.length > 0)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'usertaken', mail: email } }));
        bcrypt.hash(password, 10, (err, encrypted) => {
            if (err)
                return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
            connection.query('INSERT INTO users (uid, email, pwd) VALUES (?, ?, ?)', [username, email, encrypted], (err, results, fields) => {
                return res.redirect(url.format({ pathname: '/signup', query: { signup: 'success' } }));
            });
        });
    });
});
router.post('/login-submit', (req, res) => {
    const username = req.body.uid;
    const password = req.body.pwd;
    if (!username || !password)
        return res.redirect(url.format({ pathname: '/signup', query: { error: 'emptyfields' } }));
    connection.query('SELECT * FROM users WHERE uid=?', [username], (err, results, fields) => {
        if (err)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
        if (results.length < 1)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidlogin' } }));
        bcrypt.compare(password, results[0].pwd, (err, same) => {
            if (err)
                return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
            if (!same)
                return res.redirect(url.format({ pathname: '/signup', query: { error: 'invalidlogin' } }));
            req.session.isLoggedIn = true;
            req.session.username = username;
            req.session.uid = results[0].id;
            res.redirect(url.format({ pathname: '/todo', query: { login: 'success' } }));
        });
    });
});
router.post('/resetpassword', (req, res) => {
    if (!req.body.pwd)
        return res.redirect(url.format({ pathname: '/signup', query: { newpwd: 'empty' } }));
    const password = req.body.pwd;
    const passwordRepeat = req.body.pwdrepeat;
    if (password !== passwordRepeat)
        return res.redirect(url.format({ pathname: '/signup', query: { newpwd: 'pwdnomatch' } }));
    const selector = req.body.selector;
    const validator = req.body.validator;
    const currentDate = Date.now() / 1000;
    connection.query('SELECT * FROM pwdreset WHERE selector=? AND expires >= ?', [selector, currentDate], (err, results, fields) => {
        if (err)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
        if (results.length < 1 || results.length > 1)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'tokenexpired' } }));
        const tokenBin = utils_1.hex2bin(validator).result;
        const tokenCheck = bcrypt.compareSync(tokenBin, results[0].token);
        if (!tokenCheck)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'autherror' } }));
        const tokenEmail = results[0].email;
        connection.query('SELECT * FROM users WHERE email=?;', [tokenEmail], (err, results, fields) => {
            if (err)
                return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
            if (results.length < 1 || results.length > 1)
                return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
            bcrypt.hash(password, 10, (err, encrypted) => {
                if (err)
                    return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
                connection.query('UPDATE users SET pwd=? WHERE email=?', [encrypted, tokenEmail], (err, results, fields) => {
                    if (err)
                        return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
                    connection.query('DELETE FROM pwdreset WHERE email=?', [tokenEmail], (err, results, fields) => {
                        res.redirect(url.format({ pathname: '/signup', query: { newpwd: 'passwordupdated' } }));
                    });
                });
            });
        });
    });
});
router.post('/logout', (req, res) => {
    req.session.destroy(err => { if (err)
        console.error(err); });
    res.redirect(url.format({ pathname: '/signup' }));
});
router.post('/add', (req, res) => {
    const item = req.body.name;
    connection.query('INSERT INTO items (name, user, done, created) VALUES (?, ?, 0, NOW())', [item, req.session.uid], (err, results, fields) => {
        if (err)
            return res.redirect(url.format({ pathname: '/signup', query: { error: 'dberror' } }));
        res.redirect(url.format({ pathname: '/todo' }));
    });
});
module.exports = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGJ0cmFuc2FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL2RidHJhbnNhY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxtQ0FBbUM7QUFDbkMsK0JBQStCO0FBQy9CLDJCQUEyQjtBQUMzQixpQ0FBaUM7QUFDakMsaUNBQWlDO0FBRWpDLDZDQUEwQztBQUMxQyw0Q0FBa0U7QUFFbEUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBR2hDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztJQUN6QyxJQUFJLEVBQUUsV0FBVztJQUNqQixJQUFJLEVBQUUsTUFBTTtJQUNaLFFBQVEsRUFBRSxlQUFNO0lBQ2hCLFFBQVEsRUFBRSxhQUFhO0NBQ3ZCLENBQUMsQ0FBQztBQUdILE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ2hDLElBQUksQ0FBRSxHQUFHLENBQUMsT0FBMkIsQ0FBQyxVQUFVO1FBQUUsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTNHLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0NBQStDLEVBQUUsQ0FBRSxHQUFHLENBQUMsT0FBMkIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbEksSUFBSSxHQUFHO1lBQUUsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU3RixHQUFHLENBQUMsTUFBTSxD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