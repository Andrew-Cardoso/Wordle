import {Alpine} from 'alpinejs';

export enum ResponseStatus {
  Token_Created = 201,
  Registered_Attempt = 200,
  Invalid_Attempt = 400,
  Game_Expired = 404,
  Word_Does_Not_Exist = 444,
  Word_Already_Tried = 466,
}

export const ValidResponseStatus = [ResponseStatus.Token_Created, ResponseStatus.Registered_Attempt];

export type InvalidResponseStatus =
  | ResponseStatus.Invalid_Attempt
  | ResponseStatus.Game_Expired
  | ResponseStatus.Word_Does_Not_Exist
  | ResponseStatus.Word_Already_Tried;

export const InvalidResponseStatus = [
  ResponseStatus.Invalid_Attempt,
  ResponseStatus.Game_Expired,
  ResponseStatus.Word_Does_Not_Exist,
  ResponseStatus.Word_Already_Tried,
];

export enum LetterStatus {
  RightPlace = 0,
  WrongPlace = 1,
  WrongChar = 2,
}

export type LetterState = [letter: string, status?: LetterStatus];

export interface Attempt {
  lettersState: LetterState[];
}

export type ExtendedWindow = Window & typeof globalThis & {Alpine: Alpine};

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type AuthResponse = {token: string; status: ResponseStatus};
export type AuthState = {token: string | null};

export interface InvalidAttempt {
  status: ResponseStatus.Invalid_Attempt | ResponseStatus.Game_Expired;
}

export interface ValidAttempt {
  status: ResponseStatus.Registered_Attempt;
  hasWon: boolean;
  isGameOver: boolean;
  charactersStatus: LetterStatus[];
  word?: string;
}

export type AttemptResponse = ValidAttempt | InvalidAttempt;
