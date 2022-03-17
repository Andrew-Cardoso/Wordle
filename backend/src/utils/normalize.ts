export const normalizeWord = (word: string): string =>
	word
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
