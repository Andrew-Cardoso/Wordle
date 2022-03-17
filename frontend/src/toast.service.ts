import 'toastify-js/src/toastify.css';

import Toastify from 'toastify-js';

const toHtml = (title: string, message: string) => `
  <h1 style="font-size: 1.06rem; margin-bottom: .3rem; font-family: inherit;">${title}</h1>
  <p style="margin: 0; padding: 0; font-size: 1rem; font-family: inherit;">${message}</p>
`;

const _toast = (title: string, message: string, background: string, callback?: () => void) =>
	Toastify({
		text: toHtml(title, message),
		escapeMarkup: false,
		duration: 7500,
		close: false,
		gravity: 'top',
		position: 'right',
		stopOnFocus: true,
		callback,
		style: {background},
	});

export const toast = {
	info: (title: string, message: string) =>
		_toast(title, message, 'linear-gradient(to right, #B7632D, #87431D)').showToast(),
	error: (title: string, message: string, callback?: () => void) =>
		_toast(
			title,
			message,
			'linear-gradient(to right, #B00020AA, #B0002088, #B0002055)',
			callback,
		).showToast(),
};