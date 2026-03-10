declare module "@capacitor/core" {
  interface PluginRegsitry {
    DevicePpiPlugin : DevicePpiPlugin
  }
}

export interface DevicePpiPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  getPPI(): Promise<{ 
    xdpi?: number; 
    ydpi?: number; 
    ppi?: number; 
    scale?: number 
  }>;
}
