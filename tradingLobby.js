const { ipcRenderer } = require('electron');
const CoinListController = require('./components/coinListController');
const fileIOInterface = require('./js/fileIOInterface');



const dataDir = "data/";
fileIOInterface.makeDirSync(dataDir);

const coinListsConfigFile = "coinListsConfig.txt";
let coinLists = [];


let coinListRoot;
let coinLists_UI = [];



//once the window is ready
window.onload = function()
{
  coinListRoot = document.getElementById("coinListRoot");

  // let list = new CoinListController(coinListRoot, 'Binance');

  //load data
  coinListsLoad();
};





function coinListsLoad()
{
  let coinListsConfigFileDir = dataDir+coinListsConfigFile;

  if(fileIOInterface.checkDirSync(coinListsConfigFileDir))
    fileIOInterface.readJSONSync(coinListsConfigFileDir, coinListsConfigFileLoadCallback);
}

function coinListsConfigFileLoadCallback(config)
{
    coinLists = config.coinLists;

    coinLists.forEach(function(list) { coinLists_UI.push(new CoinListController(coinListRoot, list)); })
}





async function openATM()
{
    ipcRenderer.invoke('openATM', 'BNB/USDT')
}