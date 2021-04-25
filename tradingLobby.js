const { ipcRenderer } = require('electron');

const CoinListController = require('./components/coinListController');
const ModalBox = require('./components/ModalBox');

const fileIOInterface = require('./js/fileIOInterface');



const dataDir = "data/";
fileIOInterface.makeDirSync(dataDir);

const coinListsConfigFile = "coinListsConfig.txt";
let config = {};


let coinListRoot;
let coinLists_UI = [];



//once the window is ready
window.onload = function()
{
  coinListRoot = document.getElementById("coinListRoot");

  //load data
  coinListsLoad();
};

window.onbeforeunload = (e) => {
  //save data
  coinListsSave();

  //close list items' socket
  coinLists_UI.forEach((list)=>{ list.clearCoinListItems(false); })
}






function coinListsLoad()
{
  const coinListsConfigFileDir = dataDir+coinListsConfigFile;

  if(fileIOInterface.checkDirSync(coinListsConfigFileDir))
    fileIOInterface.readJSONSync(coinListsConfigFileDir, coinListsConfigFileLoadCallback);
}
function coinListsConfigFileLoadCallback(c)
{
  config = c;

  config.coinLists.forEach((list)=>{ coinLists_UI.push(new CoinListController(coinListRoot, list, removeCoinList)); })
}

function coinListsSave()
{
  const coinListsConfigFileDir = dataDir+coinListsConfigFile;

  fileIOInterface.writeJSONSync(coinListsConfigFileDir, config);
}





async function openATM()
{
  ipcRenderer.invoke('openATM', 'BNB/USDT');
}

async function addCoinList()
{
  config.coinLists.push({header: "New Coin List", exchange: "", items: []});
  coinLists_UI.push(new CoinListController(coinListRoot, config.coinLists[config.coinLists.length-1], removeCoinList));
}
function removeCoinList(list)
{
  let index = config.coinLists.indexOf(list);

  //remove data
  config.coinLists.splice(index, 1);

  //remove from UI
  coinListRoot.removeChild(coinLists_UI[index].coinList);  //remove from HTML
  coinLists_UI.splice(index, 1);
}