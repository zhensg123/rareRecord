
import overwriteApiAndSubscribeEvent from './overwriteApiAndSubscribeEvent'

export default class MicroFrontendFramework {
  constructor() {
    this.apps = {};
    overwriteApiAndSubscribeEvent()
  }

  registerApplication(name, app, path) {
    this.apps[name] = { app, path };
  }

  handleUrlChange() {
    const currentPath = window.location.hash.slice(1);
    this.switchApp(currentPath);
  }

  switchApp(path) {
    Object.values(this.apps).forEach(({ app, path: appPath }) => {
      if (path.startsWith(appPath)) {
        app.mount(); // 挂载应用
      } else {
        app.unmount(); // 卸载应用
      }
    });
  }
}
