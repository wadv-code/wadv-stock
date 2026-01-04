import mitt from 'mitt';

export type EmitterEvents = {
  'global-refresh': void;
  'active-refresh': void;
  'global-pause': void;
  'global-resume': void;
};

export const emitter = mitt<EmitterEvents>();
