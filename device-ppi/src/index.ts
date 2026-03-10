import { registerPlugin } from '@capacitor/core';

import type { DevicePpiPlugin } from './definitions';

const DevicePpi = registerPlugin<DevicePpiPlugin>('DevicePpi', {
  web: () => import('./web').then((m) => new m.DevicePpiWeb()),
});

export * from './definitions';
export { DevicePpi };
