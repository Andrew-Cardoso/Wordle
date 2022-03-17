import {BACKEND_URL} from './app.config';
import {
  AttemptResponse,
  AuthResponse,
  AuthState,
  HttpMethod,
  ResponseStatus,
} from './types';

const auth: AuthState = Object.seal({token: null});

const handle = async (raw: Response) => {
  const status: ResponseStatus = raw.status;
  try {
    return {
      status,
      ...(await raw.json()),
    };
  } catch (error) {
    return {status};
  }
};

const request = <T>(method: HttpMethod = 'GET', data?: Record<string, unknown>): Promise<T> => {
  const body = data ? JSON.stringify(data) : undefined;

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  auth.token && headers.append('token', auth.token);

  return fetch(BACKEND_URL, {
    method,
    body,
    headers,
  }).then(handle);
};

export const sendAttempt = async (word: string) => {
  const response = await request<AttemptResponse>('POST', {word});
  if (response.status === ResponseStatus.Registered_Attempt && response.isGameOver) auth.token = null;
  return response;
};

export const finishGame = () => auth.token && request('DELETE');

export const initState = async () => {
  const {token} = await request<AuthResponse>();
  if (!token) return false;
  auth.token = token;

  window.addEventListener('beforeunload', finishGame);

  return true;
};
