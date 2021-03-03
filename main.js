const { app, BrowserWindow, ipcMain } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 1200,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// app.on('before-quit', () => {
//   console.log('app.before-quit')
// });

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})




// ipcMain.handle('perform-action', (event, ...args) => {
//   // ... do actions on behalf of the Renderer
// })