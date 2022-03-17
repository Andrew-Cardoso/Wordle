import express from 'express';
import cors from 'cors';

import gameRoutes from './routes/game.route';

import {startRedis} from './redis.config';
import {cacheWords} from './initial-setup';

const PORT = 3690;
const app = express();
app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());
app.use('/', gameRoutes);


(async () => {
	await startRedis();
	await cacheWords();

	app.listen(PORT, () => console.log(`Server is open on port ${PORT}`));
})();
