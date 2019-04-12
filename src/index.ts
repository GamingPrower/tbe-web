import * as express from 'express';
import * as session from 'express-session';
import * as mysql from 'mysql';
import * as url from 'url';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import logger from './middleware/logger';
import { dbPass } from './config/config';
import { bin2hex, hex2bin, newUserEmail } from './modules/utils';
const app = express();
const requireDir = require('require-dir');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(logger);
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'passport-todo', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

// Static Middleware
app.use('/public/img/', express.static('./public/img'));
app.use('/public/styles/', express.static('./public/styles'));

const routes = requireDir('./routes');

for (const i in routes) app.use('/', routes[i]);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
