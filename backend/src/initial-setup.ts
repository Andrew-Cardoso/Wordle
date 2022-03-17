import axios from 'axios';
import {redis} from './redis.config';
import {normalizeWord} from './utils/normalize';

const getWords = async (): Promise<string[]> => {
  const {data} = await axios.get('https://www.ime.usp.br/~pf/dicios/br-utf8.txt');
  return data.split(/\s+/);
};

const filterValidWords = (words: string[]) => words.filter(word => word.length === 5);

export const cacheWords = async () => {
  const hasWords = await redis.exists('words');
  if (hasWords) return;

  const words = await getWords();
  const validWords = filterValidWords(words);

  const wordsLowerCase: string[] = [];
  const normalizedWords: string[] = [];

  for (const word of validWords) {
    wordsLowerCase.push(word.toLowerCase());
    normalizedWords.push(normalizeWord(word));
  }

  await Promise.all([
    redis.set('words', JSON.stringify(wordsLowerCase)),
    redis.set('normalizedWords', JSON.stringify(normalizedWords)),
  ]);
};
