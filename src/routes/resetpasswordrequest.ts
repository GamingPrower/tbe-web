import * as express from 'express';

const router = express.Router();

// Reset Password Request
router.get('/resetpasswordrequest', (req, res) => res.render('pages/resetpasswordrequest'));

module.exports = router;
