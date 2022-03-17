import {sendAttempt, finishGame} from './app.service';
import {DELETE_LETTER_KEYS, NAVIGATION_LETTER_KEYS, SUBMIT_KEYS, VALID_LETTERS} from './state.constants';
import {
  initAttempts,
  handleInit,
  resetAttempts,
  letterStatusFeedback,
  normalizeKey,
  handleBackspace,
  handleNavigateLetters,
  handleSubmition,
  focusNextEmptyInput,
  handleInvalidAttempt,
  handleEndScreen,
} from './state.utils';
import {toast} from './toast.service';
import {LetterState, LetterStatus, ResponseStatus, ValidAttempt} from './types';

export const StateStore = {
  availableLetters: [...VALID_LETTERS],
  currentAttempt: 0,
  attempts: initAttempts(),
  loading: true,
  init() {
    '$watch' in this && handleInit().then(() => (this.loading = false));
  },
  getWord() {
    return this.attempts[this.currentAttempt]?.lettersState.map(([letter]) => letter).join('');
  },
  updateState({hasWon, isGameOver, charactersStatus, word}: ValidAttempt) {
    const attempt = this.attempts[this.currentAttempt++];
    charactersStatus.forEach((status, i) => {
      const letterState = attempt.lettersState[i];
      letterState[1] = status;
      if (status === LetterStatus.WrongChar)
        this.availableLetters = this.availableLetters.filter(letter => letter !== letterState[0].toLowerCase());
    });
    return {hasWon, isGameOver, word};
  },
  async submitAttempt() {
    this.loading = true;
    const attempt = this.getWord();
    const response = await sendAttempt(attempt);

    const restartGameFunction = () => this.restartState();

    if (response.status !== ResponseStatus.Registered_Attempt) {
      handleInvalidAttempt(response.status, attempt, restartGameFunction);
      if (response.status !== ResponseStatus.Game_Expired) this.loading = false;
      return;
    }

    const {hasWon, isGameOver, word} = this.updateState(response);

    isGameOver ? handleEndScreen(hasWon, word!, restartGameFunction) : focusNextEmptyInput(this.currentAttempt);
    this.loading = false;
  },
  async restartState() {
    this.loading = true;
    await finishGame();
    resetAttempts(this.attempts);
    this.currentAttempt = 0;
    this.availableLetters = [...VALID_LETTERS];
    await handleInit();
    focusNextEmptyInput(0);
    this.loading = false;
  },
  onPlayerInput(event: KeyboardEvent, letterState: LetterState) {
    const key = normalizeKey(event.key);

    const {lettersState} = this.attempts[this.currentAttempt];
    const letterIndex = lettersState.indexOf(letterState);

    if (DELETE_LETTER_KEYS.includes(key)) return handleBackspace(letterState, this.currentAttempt, letterIndex);

    if (NAVIGATION_LETTER_KEYS.includes(key)) return handleNavigateLetters(key, this.currentAttempt, letterIndex);

    if (SUBMIT_KEYS.includes(key)) return handleSubmition();

    if (!VALID_LETTERS.includes(key)) return;

    if (!this.availableLetters.includes(key))
      return toast.info('Letra invalida', `"${key.toUpperCase()}" nao existe na palavra`);

    letterState[0] = key;
    focusNextEmptyInput(this.currentAttempt, lettersState);
  },
  letterStatusClass(letterStatus: LetterStatus) {
    return {
      'right-place': letterStatus === LetterStatus.RightPlace,
      'wrong-place': letterStatus === LetterStatus.WrongPlace,
      'wrong-char': letterStatus === LetterStatus.WrongChar,
    };
  },
  toggleTooltip(el: HTMLDivElement, [letter, status]: LetterState) {
    typeof status !== 'undefined'
      ? el.setAttribute('aria-label', letterStatusFeedback(letter)[status])
      : el.removeAttribute('aria-label');
  },
};
