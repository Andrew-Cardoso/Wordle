import {redis} from '../redis.config';
import {normalizeWord} from '../utils/normalize';

interface GameState {
	word: string;
	attempts: string[];
}

enum CharStatusEnum {
	RightPlace = 0,
	WrongPlace = 1,
	WrongChar = 2,
}
interface AttemptResponse {
	isGameOver: boolean;
	hasWon: boolean;
	word: string | false;
	charactersStatus: CharStatusEnum[];
}

const expireTime = 3600 * 6;

const random = (from: number, to: number) => Math.floor(Math.random() * (to - from) + from);

const getWords = async (key: 'words' | 'normalizedWords' = 'words'): Promise<string[]> => {
	const json = await redis.get(key);
	const words = JSON.parse(json ?? '[]');
	return words;
}

const getGameState = async (key: string) => {
	const json = await redis.get(key);
	const state: GameState = JSON.parse(<string>json);
	return state;
}

export const wordExists = async (word: string) => {
	const words = await getWords('normalizedWords');
	return words.includes(normalizeWord(word));
}

export const stateExists = async (key: string) => key && (await redis.exists(key));
export const deleteState = async (key: string) => await redis.del(key);

export const getRandomWord = async () => {
	const words = await getWords();
	const i = random(0, words.length);
	const word = words[i];
	return word;
};

export const saveState = async (key: string, word: string) => {
	const state: GameState = {
		word,
		attempts: [],
	};
	await redis.set(key, JSON.stringify(state), {
		EX: expireTime,
	});
};

export const alreadyTriedWord = async (key: string, word: string): Promise<boolean> => {
	const state = await getGameState(key);
	const attempts = state.attempts.map(normalizeWord);
	return attempts.includes(normalizeWord(word));
}

export const addAttempt = async (key: string, attempt: string): Promise<AttemptResponse> => {
	const state = await getGameState(key);
	state.attempts.push(attempt);

	const normalizedWord = normalizeWord(state.word);
	const normalizedAttempt = normalizeWord(attempt);

	const hasWon = normalizedAttempt === normalizedWord;
	const isGameOver = hasWon || state.attempts.length === 6;
	

	await redis.set(key, JSON.stringify(state), {
		EX: expireTime,
	});

	const charactersStatus: CharStatusEnum[] = [];
	for (let i = 0; i < normalizedAttempt.length; i++) {
		const char = normalizedAttempt[i];
		const status =
			char === normalizedWord[i]
				? CharStatusEnum.RightPlace
				: normalizedWord.includes(char)
				? CharStatusEnum.WrongPlace
				: CharStatusEnum.WrongChar;
		charactersStatus.push(status);
	}

	return {
		isGameOver,
		hasWon,
		charactersStatus,
		word: isGameOver && state.word,
	};
};
