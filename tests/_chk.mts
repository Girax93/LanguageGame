import { defaultPlayerState, STATE_VERSION } from '../src/state/types.ts';
console.log('types.ts parsed OK; version', STATE_VERSION, 'focusPool' in defaultPlayerState(0,5));
