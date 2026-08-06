export class App {
  vault = {
    configDir: '/mock/config/dir',
    adapter: {
      exists: async () => false,
      readBinary: async () => new ArrayBuffer(0),
      writeBinary: async () => {},
      mkdir: async () => {},
    }
  };
}
