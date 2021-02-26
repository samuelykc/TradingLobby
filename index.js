const { ipcRenderer } = require('electron')





let Binance_BNB_USDT = 224.311;
let BitMax_BNB_USDT = 224.821;

window.onload = function () {
    document.getElementById("Binance_BNB_USDT").innerHTML = Binance_BNB_USDT;
    document.getElementById("BitMax_BNB_USDT").innerHTML = BitMax_BNB_USDT;
};