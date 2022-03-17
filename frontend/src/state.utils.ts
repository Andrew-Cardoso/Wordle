import {initState} from './app.service';
import {TOTAL_LETTERS, TOTAL_ATTEMPTS} from './state.constants';
import {toast} from './toast.service';
import {LetterState, Attempt, LetterStatus, InvalidResponseStatus, ResponseStatus} from './types';

const getLetterInput = (attemptIndex: number, index: number) =>
  (
    (document.querySelectorAll('.word-attempt')![attemptIndex] as HTMLDivElement).querySelectorAll(
      '.letter-container',
    )![index] as HTMLDivElement
  ).firstElementChild as HTMLInputElement;

const getBtnSubmit = () => {
  const btn = document.querySelector('.send-attempt') as HTMLButtonElement | null;
  return btn?.offsetParent ? btn : null;
};

export const normalizeKey = (userInput: string) =>
  userInput
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const initLettersState = () => {
  const lettersState: LetterState[] = [];
  for (let i = 0; i < TOTAL_LETTERS; i++) lettersState.push(['']);
  return lettersState;
};

export const initAttempts = (): Attempt[] => {
  const attempts: Attempt[] = [];

  for (let i = 0; i < TOTAL_ATTEMPTS; i++) attempts.push({lettersState: initLettersState()});

  return attempts;
};

export const resetAttempts = (attempts: Attempt[]) =>
  attempts.forEach(attempt => (attempt.lettersState = initLettersState()));

export const handleInit = async () => {
  const hasStartedCorrectly = await initState();
  if (!hasStartedCorrectly) return toast.error('Erro ao iniciar jogo', 'Ocorreu um erro, por favor atualize a pagina');
};

export const letterStatusFeedback = (letter: string) => ({
  [LetterStatus.RightPlace]: `"${letter.toUpperCase()}" está certa`,
  [LetterStatus.WrongPlace]: `"${letter.toUpperCase()}" está no lugar errado`,
  [LetterStatus.WrongChar]: `"${letter.toUpperCase()}" não existe na palavra`,
});

export const handleBackspace = (letterState: LetterState, attemptIndex: number, letterIndex: number) => {
  if (letterState[0] !== '') {
    letterState[0] = '';
    return;
  }
  setTimeout(() => getLetterInput(attemptIndex, Math.max(0, letterIndex - 1))?.focus());
};

export const handleNavigateLetters = (key: string, attemptIndex: number, letterIndex: number) => {
  letterIndex += ['arrowleft', 'arrowdown'].includes(key) ? -1 : 1;
  const i = letterIndex > 4 ? 0 : letterIndex < 0 ? 4 : letterIndex;

  setTimeout(() => getLetterInput(attemptIndex, i)?.focus());
};

export const handleSubmition = () => getBtnSubmit()?.click();

export const focusNextEmptyInput = (attemptIndex: number, lettersState?: LetterState[]) => {
  const emptyIndex = lettersState?.findIndex(([letter]) => letter === '') ?? 0;
  const el = emptyIndex === -1 ? getBtnSubmit() : getLetterInput(attemptIndex, emptyIndex);
  setTimeout(() => el?.focus?.());
};

type RestartGameFunction = () => Promise<void>;
export const handleInvalidAttempt = (status: InvalidResponseStatus, word: string, restart: RestartGameFunction) => {
  if (status === ResponseStatus.Invalid_Attempt)
    return toast.error('Tentativa invalida', 'A palavra deve ter exatamente 5 letras');

  if (status === ResponseStatus.Game_Expired)
    return toast.error('Jogo expirado', 'Aguarde, estamos criando um novo', restart);

  if (status === ResponseStatus.Word_Does_Not_Exist)
    return toast.error('Palavra invalida', `"${word.toUpperCase()}" nao existe no nosso dicionario`);

  if (status === ResponseStatus.Word_Already_Tried) return toast.error('Tentativa invalida', `Voce ja tentou "${word.toUpperCase()}"`);
};

export const handleEndScreen = (winner: boolean, word: string, restart: RestartGameFunction) => {
  const endScreen = document.getElementById('end-screen')!;

  const [titleText, titleClass] = winner
    ? ['Parabens, voce ganhou! &#128526;', 'win-text']
    : ['Nao foi dessa vez &#128547;', 'lost-text'];

  const h1 = endScreen.querySelector('h1')!;
  h1.innerHTML = titleText;
  h1.className = titleClass;

  const strong = endScreen.querySelector('strong')!;
  strong.innerText = word;

  const btnRestart = endScreen.querySelector('button')!;
  btnRestart.addEventListener(
    'click',
    () =>
      restart().then(() => {
        endScreen.classList.remove('show');
        setTimeout(() => focusNextEmptyInput(0));
      }),
    {once: true},
  );

  endScreen.classList.add('show');
  setTimeout(() => btnRestart.focus());
};
