const { app, BrowserWindow, ipcMain } = require('electron')



function createWindow () {
    const win = new BrowserWindow({
        width: 570,
        height: 1000,
        webPreferences: {
            contextIsolation: false,    //so that the window could access other scripts with require
            nodeIntegration: true
        }
    })

    win.loadFile('tradingLobby.html')
}

app.whenReady().then(createWindow)




app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

// app.on('before-quit', () => {
//     console.log('app.before-quit')
// });

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});





/* ------------------ Windows Manager ------------------ */

//TODO: manager key-value dict of ATMs
function openATM () {
    const atmWin = new BrowserWindow({
        width: 820,
        height: 1200,
        webPreferences: {
            nodeIntegration: true
        }
    })

    atmWin.loadFile('arbitrageTrader.html')
}

ipcMain.handle('openATM', (event, tradingPair) => {
    openATM();
})
