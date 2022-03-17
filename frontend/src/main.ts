import Alpine from 'alpinejs';
import {StateStore} from './state.store';
import {ExtendedWindow} from './types';

import 'balloon-css';

const global = window as ExtendedWindow;

global.Alpine = Alpine;

Alpine.store('state', StateStore);

Alpine.start();
