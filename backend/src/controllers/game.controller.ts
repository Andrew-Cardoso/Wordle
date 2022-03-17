import {Request, Response} from 'express';
import {v4 as uuid} from 'uuid';
import {
	addAttempt,
	alreadyTriedWord,
	deleteState,
	getRandomWord,
	saveState,
	stateExists,
	wordExists,
} from '../services/game.service';

export const start = async (_: Request, response: Response) => {
	const word = await getRandomWord();
	const sessionId = uuid();

	await saveState(sessionId, word);

	return response.status(201).json({token: sessionId});
};

export const check = async ({body: {word: attempt}, headers}: Request, response: Response) => {
	const token = <string>headers.token;
	if (!(await stateExists(token)))
		return response.sendStatus(404);

	if (!attempt || attempt.length !== 5)
		return response.sendStatus(400);

	if (!(await wordExists(attempt)))
		return response.sendStatus(444);

	if (await alreadyTriedWord(token, attempt))
		return response.sendStatus(466);

	const {isGameOver, hasWon, charactersStatus, word} = await addAttempt(token, attempt);

	if (hasWon || isGameOver) await deleteState(token);

	return response.status(200).json({hasWon, isGameOver, charactersStatus, word});
};

export const end = async ({headers}: Request, response: Response) => {
	const token = <string>headers.token;
	if (await stateExists(token)) await deleteState(token);
	return response.sendStatus(204);
};
