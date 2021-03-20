const { ipcRenderer } = require('electron');
const binanceInterface = require('./js/binanceInterface');
const bitmaxInterface = require('./js/bitmaxInterface');
const ftxInterface = require('./js/ftxInterface');
const fileIOInterface = require('./js/fileIOInterface');
const mathExtend = require('./js/mathExtend');
const dateFormat = require('dateformat');






//once the window is ready
window.onload = function()
{

};





async function openATM()
{
    ipcRenderer.invoke('openATM', 'BNB/USDT')
}