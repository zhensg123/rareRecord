export default function loadApps(appName) {
  // 假设每个应用的入口文件都在 /apps/{appName}/main.js
  const appUrl = `/apps/${appName}/main.js`;

  fetch(appUrl)
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error(`Failed to load app: ${appName}`);
      }
    })
    .then(code => {
      eval(code);
    })
    .catch(error => {
      console.error(error);
    });
}