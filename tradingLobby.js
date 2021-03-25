const { ipcRenderer } = require('electron');
const CoinListController = require('./components/coinListController');



//once the window is ready
window.onload = function()
{
  const coinListRoot = document.getElementById("coinListRoot");

  let list = new CoinListController(coinListRoot, 'Binance');
};





async function openATM()
{
    ipcRenderer.invoke('openATM', 'BNB/USDT')
}