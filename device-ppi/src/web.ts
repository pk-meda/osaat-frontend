import { WebPlugin } from '@capacitor/core';

import type { DevicePpiPlugin } from './definitions';

export class DevicePpiWeb extends WebPlugin implements DevicePpiPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async getPPI() {
    // Approximation for web debugging (not native)
    const div = document.createElement('div');
    div.style.width = '1in';
    div.style.height = '1in';
    div.style.position = 'absolute';
    div.style.top = '-100%';
    document.body.appendChild(div);
    const ppi = div.offsetWidth;
    document.body.removeChild(div);

    return { xdpi: ppi, ydpi: ppi };
  }
}
