import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronStore', {
  get: (key) => ipcRenderer.invoke('store-get-value', key),
  set: (key, value) => ipcRenderer.send('store-set-value', key, JSON.parse(value)),
})

contextBridge.exposeInMainWorld('fileSystem', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  createFolders: (directory, folder, subfolders) =>
    ipcRenderer.invoke('create-folders', directory, folder, subfolders),
  openFolder: (folderPath) => ipcRenderer.send('open-folder', folderPath),
})

contextBridge.exposeInMainWorld('updater', {
  checkForUpdates: () => ipcRenderer.send('check-for-update'),
  listenForUpdates: (callback) =>
    ipcRenderer.on('check-for-update', (_event, data) => callback(data)),
  applyUpdate: () => ipcRenderer.send('apply-update'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  getVersion: () => ipcRenderer.invoke('get-version'),
})
/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */
