import * as express from 'express';
import * as moment from 'moment';

const logger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.log(`${req.protocol}://${req.get('host')}${req.originalUrl} - ${moment().format()}`);
	next();
};

export default logger;
