const { ipcRenderer } = require('electron');
const coinListItem = require('./components/coinListItem');



//once the window is ready
window.onload = function()
{
  const coinList = document.getElementById("tempTest_coinList");
  const pairName = 'BTC/USDT';
  const alarms = '';
  coinListItem.create(coinList, pairName, alarms);
};





async function openATM()
{
    ipcRenderer.invoke('openATM', 'BNB/USDT')
}