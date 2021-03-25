const { app, BrowserWindow, ipcMain } = require('electron')
const dateFormat = require('dateformat');

const binanceInterface = require('./js/binanceInterface');
const bitmaxInterface = require('./js/bitmaxInterface');
const ftxInterface = require('./js/ftxInterface');



function createWindow () {
    const win = new BrowserWindow({
        width: 820,
        height: 1200,
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




/* ------------------ Data Fetcher ------------------ */

let marketSubscriptions = [];

async function fetchMarketData()
{
    // binanceInterface.subscribeTickerStream('btcusdt', (d)=>{console.log(d)}, ()=>{});


    while(true)
    {
        console.log('test');

        await delay(100);
    }
};

app.whenReady().then(fetchMarketData);



ipcMain.handle('subscribeMarketData', (event, subscription) => {
    marketSubscriptions.push(subscription);
})




function delay(t, val) {
     return new Promise(function(resolve) {
             setTimeout(function() {
                     resolve(val);
             }, t);
     });
}