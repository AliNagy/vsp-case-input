import { app, dialog, ipcMain, BrowserWindow } from 'electron'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import Store from 'electron-store'

const store = new Store()

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  })

  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL)
  } else {
    mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  ipcMain.handle('store-get-value', (event, key) => {
    return store.get(key)
  })
  ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
    })
    return canceled ? null : filePaths[0]
  })
  ipcMain.handle('create-folders', async (event, directory, folder, subfolders) => {
    // Construct the full path to the new folder
    const newFolderPath = path.join(directory, folder)

    // Create the main folder if it doesn't exist
    try {
      await fs.stat(newFolderPath)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(newFolderPath)
      } else {
        console.error('Error checking/creating main folder:', err)
        return
      }
    }

    // Create subfolders within the main folder
    for (const subfolder of subfolders) {
      const subfolderPath = path.join(newFolderPath, subfolder)
      try {
        await fs.stat(subfolderPath)
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fs.mkdir(subfolderPath)
        } else {
          console.error('Error checking/creating subfolder:', err)
        }
      }
    }

    return newFolderPath
  })
  ipcMain.on('store-set-value', (event, key, value) => {
    store.set(key, value)
  })
  createWindow()
})

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
