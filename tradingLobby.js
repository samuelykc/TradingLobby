const { ipcRenderer } = require('electron');
const CoinListController = require('./components/coinListController');
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

  config.coinLists.forEach(function(list) { coinLists_UI.push(new CoinListController(coinListRoot, list)); })
}

function coinListsSave()
{
  config.coinLists.forEach(function(list) { list.items.forEach(function(item) { console.log("item.monitor: "+item.monitor) }) })

  const coinListsConfigFileDir = dataDir+coinListsConfigFile;

  fileIOInterface.writeJSONSync(coinListsConfigFileDir, config);
}





async function openATM()
{
    ipcRenderer.invoke('openATM', 'BNB/USDT')
}