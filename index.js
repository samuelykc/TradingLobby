const { ipcRenderer } = require('electron');
const binanceInterface = require('./js/binanceInterface');
const bitmaxInterface = require('./js/bitmaxInterface');
const ftxInterface = require('./js/ftxInterface');
const fileIOInterface = require('./js/fileIOInterface');
const mathExtend = require('./js/mathExtend');
const dateFormat = require('dateformat');



const dataDir = "data/";
fileIOInterface.makeDirSync(dataDir);

const configFile = "config.txt";


let Binance_fee = 0.001;
let BitMax_fee = 0.001;
let fee = {};
fee["Binance"] = 0.001;
fee["BitMax"] = 0.001;
fee["FTX"] = 0.0007;



/* ------------------ Account Balance ------------------ */
let ac_BNB = {};
let ac_USDT = {};

let walletLastUpdate = {};  //timestamp
walletLastUpdate["Binance"] = 0;
walletLastUpdate["BitMax"] = 0;
walletLastUpdate["FTX"] = 0;


/* ------------------ BNB/USDT Market ------------------ */
let BNB_USDT_close = {};
let BNB_USDT_bid = {}, BNB_USDT_bidVol = {};
let BNB_USDT_ask = {}, BNB_USDT_askVol = {};

let ABuy_BSell, ABuy_BSell_withFee;
let ASell_BBuy, ASell_BBuy_withFee;
let maxProfit, maxProfit_withFee, maxProfit_Vol, maxProfit_direction;

let closeLastUpdate = {};  //timestamp
closeLastUpdate["Binance"] = 0;
// closeLastUpdate["BitMax"] = 0;
closeLastUpdate["FTX"] = 0;

let orderBookLastUpdate = {};  //timestamp
orderBookLastUpdate["Binance"] = 0;
orderBookLastUpdate["BitMax"] = 0;
orderBookLastUpdate["FTX"] = 0;


/* ------------------ Profitable Price Records ------------------ */
const priceRecordFile = "_priceRecord.csv";  //exchangeA + exchangeB + "_priceRecord.csv"


/* ------------------ Trade History ------------------ */
const tradeHistoryFile = "tradeHistory.json";
let tradeHistory = {};







//set API keys
setAPIKeys();

function setAPIKeys()
{
    fileIOInterface.readJSONSync(dataDir+configFile, setAPIKeysCB);
}

function setAPIKeysCB(json)
{
    binanceInterface.setAPIKeys(json.binanceAPIPublicKey, json.binanceAPISecretKey);
    bitmaxInterface.setAPIKeys(json.bitmaxAPIPublicKey, json.bitmaxAPISecretKey);
    ftxInterface.setAPIKeys(json.ftxAPIPublicKey, json.ftxAPISecretKey);
}






//once the window is ready, loop the fetchers
window.onload = function()
{
    initializeModalBox();

    //set
    setExchange();

    //load data
    priceRecorderLoad();
    tradeHistoryLoad();

    //turn on asyncAccountFetcher() & asyncMarketFetcher()
    asyncAccountFetcher();
    asyncMarketFetcher();

    //test code
    // toggleTrader();
    // traderTrade();

    //test code
    // let parms = {
    //     symbol: "BNB/USDT",
    //     side: "sell",
    //     orderType: "limit",
    //     orderQty: "0.1",
    //     orderPrice: "300.0",
    //     // timeInForce: "GTC"
    //     // id: "ATM_generated_order_1"
    // };
    // bitmaxInterface.postOrder(parms, bitmaxPostOrderCB);
};

window.onbeforeunload = (e) => {
    //save trade history
    let tradeHistoryFileDir = dataDir+tradeHistoryFile;
    fileIOInterface.writeJSONSync(tradeHistoryFileDir, tradeHistory);
}




function delay(t, val) {
   return new Promise(function(resolve) {
       setTimeout(function() {
           resolve(val);
       }, t);
   });
}





/* ------------------ Exchange Manager ------------------ */
let operating = true;
let exchangeA, exchangeB;
function setExchange()
{
    exchangeA = document.getElementById("exchangeA").value;
    exchangeB = document.getElementById("exchangeB").value;

    document.getElementById("ac_exchangeA").innerHTML = exchangeA;
    document.getElementById("ac_exchangeB").innerHTML = exchangeB;
    document.getElementById("market_exchangeA").innerHTML = exchangeA;
    document.getElementById("market_exchangeB").innerHTML = exchangeB;
    document.getElementById("priceRecord_exchangeA").innerHTML = exchangeA;
    document.getElementById("priceRecord_exchangeB").innerHTML = exchangeB;
}
async function setExchangeAndRestart()
{
    if(traderActive) toggleTrader();

    //shut down asyncAccountFetcher() & asyncMarketFetcher()
    operating = false;
    await delay(2000);

    //set
    setExchange();

    //clear data
    priceRecorderClearUI();

    //load data
    priceRecorderLoad();
    tradeHistoryLoad();

    //turn on asyncAccountFetcher() & asyncMarketFetcher()
    operating = true;
    asyncAccountFetcher();
    asyncMarketFetcher();
}





/* ------------------ Account Balance ------------------ */
let binanceGetWalletAllCoinRespondHandled = true;
let bitmaxGetWalletAllCoinRespondHandled = true;
let ftxGetWalletAllCoinRespondHandled = true;

async function asyncAccountFetcher() {
    while(operating)
    {
        if(exchangeA=="Binance" || exchangeB=="Binance")
        {
            if(binanceGetWalletAllCoinRespondHandled)
            {
                binanceGetWalletAllCoinRespondHandled = false;

                binanceInterface.getWalletAllCoin(binanceGetWalletAllCoinCB);
            }
            
            //resume from failed respond waiting
            if(!binanceGetWalletAllCoinRespondHandled && walletLastUpdate["Binance"] > 1000) binanceGetWalletAllCoinRespondHandled = true;
        }

        if(exchangeA=="BitMax" || exchangeB=="BitMax")
        {
            if(bitmaxGetWalletAllCoinRespondHandled)
            {
                bitmaxGetWalletAllCoinRespondHandled = false;

                bitmaxInterface.getWalletAllCoin(bitmaxGetWalletAllCoinCB);
            }

            //resume from failed respond waiting
            if(!bitmaxGetWalletAllCoinRespondHandled && walletLastUpdate["BitMax"] > 1000) bitmaxGetWalletAllCoinRespondHandled = true;
        }

        if(exchangeA=="FTX" || exchangeB=="FTX")
        {
            if(ftxGetWalletAllCoinRespondHandled)
            {
                ftxGetWalletAllCoinRespondHandled = false;

                ftxInterface.getWalletAllCoin(ftxGetWalletAllCoinCB);
            }

            //resume from failed respond waiting
            if(!ftxGetWalletAllCoinRespondHandled && walletLastUpdate["FTX"] > 1000) ftxGetWalletAllCoinRespondHandled = true;
        }

        //calculate time since last update
        let currentTime = Date.now();
        let exchangeA_WalletLastUpdatePassed = Math.abs(currentTime - walletLastUpdate[exchangeA]);
        let exchangeB_WalletLastUpdatePassed = Math.abs(currentTime - walletLastUpdate[exchangeB]);

        //show time
        document.getElementById("exchangeA_WalletLastUpdatePassed").innerHTML = exchangeA_WalletLastUpdatePassed + " ms";
        document.getElementById("exchangeB_WalletLastUpdatePassed").innerHTML = exchangeB_WalletLastUpdatePassed + " ms";

        
        await delay(1000);
    }
}

//callbacks
function binanceGetWalletAllCoinCB(resBody)
{
    if(resBody)
    {
        walletLastUpdate["Binance"] = Date.now();

        ac_BNB["Binance"] = parseFloat(resBody.find(e => e.coin === "BNB").free);
        ac_USDT["Binance"] = parseFloat(resBody.find(e => e.coin === "USDT").free);

        updateAc("Binance");
        recalAcSum();
    }

    binanceGetWalletAllCoinRespondHandled = true;
}

function bitmaxGetWalletAllCoinCB(resBody)
{
    if(resBody)
    {
        walletLastUpdate["BitMax"] = Date.now();

        let BNB_record = resBody.data.find(e => e.asset === "BNB");
        let USDT_record = resBody.data.find(e => e.asset === "USDT");

        ac_BNB["BitMax"] = BNB_record? parseFloat(BNB_record.totalBalance) : 0;
        ac_USDT["BitMax"] = USDT_record? parseFloat(USDT_record.totalBalance): 0;

        updateAc("BitMax");
        recalAcSum();
    }

    bitmaxGetWalletAllCoinRespondHandled = true;
}

function ftxGetWalletAllCoinCB(resBody)
{
    if(resBody && resBody.success==true)
    {
        walletLastUpdate["FTX"] = Date.now();

        let BNB_record = resBody.result.find(e => e.coin === "BNB");
        let USDT_record = resBody.result.find(e => e.coin === "USDT");

        ac_BNB["FTX"] = BNB_record? parseFloat(BNB_record.free) : 0;
        ac_USDT["FTX"] = USDT_record? parseFloat(USDT_record.free): 0;

        updateAc("FTX");
        recalAcSum();
    }

    ftxGetWalletAllCoinRespondHandled = true;
}

//UI
function updateAc(exchange)
{
    const ac_exchangeA_BNB = document.getElementById("ac_exchangeA_BNB");
    const ac_exchangeA_USDT = document.getElementById("ac_exchangeA_USDT");
    const ac_exchangeB_BNB = document.getElementById("ac_exchangeB_BNB");
    const ac_exchangeB_USDT = document.getElementById("ac_exchangeB_USDT");

    if(exchange==exchangeA)
    {
        ac_exchangeA_BNB.innerHTML = ac_BNB[exchange];
        ac_exchangeA_USDT.innerHTML = ac_USDT[exchange];
    }
    if(exchange==exchangeB)
    {
        ac_exchangeB_BNB.innerHTML = ac_BNB[exchange];
        ac_exchangeB_USDT.innerHTML = ac_USDT[exchange];
    }
}
//recalculation
function recalAcSum()
{
    if((ac_BNB[exchangeA]||ac_BNB[exchangeA]==0) && (ac_BNB[exchangeB]||ac_BNB[exchangeB]==0))
    {
        let sum = ac_BNB[exchangeA] + ac_BNB[exchangeB];
        document.getElementById("ac_sum_BNB").innerHTML = sum;
    }
    if((ac_USDT[exchangeA]||ac_USDT[exchangeA]==0) && (ac_USDT[exchangeB]||ac_USDT[exchangeB]==0))
    {
        let sum = ac_USDT[exchangeA] + ac_USDT[exchangeB];
        document.getElementById("ac_sum_USDT").innerHTML = sum;
    }
}




/* ------------------ BNB/USDT Market ------------------ */
let binanceGetPriceRespondHandled = true;
let binanceGetOrderBookRespondHandled = true;

let bitmaxGetTickerRespondHandled = true;

let ftxGetPriceRespondHandled = true;
let ftxGetOrderBookRespondHandled = true;

async function asyncMarketFetcher() {
    while(operating)
    {
        //calculate time since last update
        let currentTime = Date.now();

        let Binance_PriceLastUpdatePassed = currentTime - closeLastUpdate["Binance"];
        let FTX_PriceLastUpdatePassed = currentTime - closeLastUpdate["FTX"];

        let orderBookLastUpdatePassed = {};
        orderBookLastUpdatePassed["Binance"] = currentTime - orderBookLastUpdate["Binance"];
        orderBookLastUpdatePassed["BitMax"] = currentTime - orderBookLastUpdate["BitMax"];
        orderBookLastUpdatePassed["FTX"] = currentTime - orderBookLastUpdate["FTX"];


        //Binance
        if(exchangeA=="Binance" || exchangeB=="Binance")
        {
            if(binanceGetPriceRespondHandled && Binance_PriceLastUpdatePassed > 1000)   //the price is irrelevant to decision making, need not to be frequently updately as to save request allowance
            {
                binanceGetPriceRespondHandled = false;
                
                const parms = {
                    symbol: "BNBUSDT"
                };
                binanceInterface.getPrice(parms, binanceGetPriceCB);
            }
            if(binanceGetOrderBookRespondHandled)
            {
                binanceGetOrderBookRespondHandled = false;
                
                const parms = {
                    symbol: "BNBUSDT"
                };
                binanceInterface.getOrderBook(parms, binanceGetOrderBookCB);
            }

            //resume from failed respond waiting
            if(!binanceGetPriceRespondHandled && Binance_PriceLastUpdatePassed > 2000) binanceGetPriceRespondHandled = true;
            if(!binanceGetOrderBookRespondHandled && orderBookLastUpdatePassed["Binance"] > 1000) binanceGetOrderBookRespondHandled = true;
        }

        //Bitmax
        if(exchangeA=="BitMax" || exchangeB=="BitMax")
        {
            if(bitmaxGetTickerRespondHandled)
            {
                bitmaxGetTickerRespondHandled = false;

                const parms = {
                    symbol: "BNB/USDT"
                };
                bitmaxInterface.getTicker(parms, bitmaxGetTickerCB);
            }
            
            //resume from failed respond waiting
            if(!bitmaxGetTickerRespondHandled && orderBookLastUpdatePassed["BitMax"] > 1000) bitmaxGetTickerRespondHandled = true;
        }

        //FTX
        if(exchangeA=="FTX" || exchangeB=="FTX")
        {
            if(ftxGetPriceRespondHandled && FTX_PriceLastUpdatePassed > 1000)   //the price is irrelevant to decision making, need not to be frequently updately as to save request allowance
            {
                ftxGetPriceRespondHandled = false;
                ftxInterface.getPrice("BNB/USDT", ftxGetPriceCB);
            }
            if(ftxGetOrderBookRespondHandled)
            {
                ftxGetOrderBookRespondHandled = false;
                
                const parms = {
                    depth: 1
                };
                ftxInterface.getOrderBook("BNB/USDT", parms, ftxGetOrderBookCB);
            }

            //resume from failed respond waiting
            if(!ftxGetPriceRespondHandled && FTX_PriceLastUpdatePassed > 2000) ftxGetPriceRespondHandled = true;
            if(!ftxGetOrderBookRespondHandled && orderBookLastUpdatePassed["FTX"] > 1000) ftxGetOrderBookRespondHandled = true;
        }
        
        //show time
        document.getElementById("exchangeA_OrderBookLastUpdatePassed").innerHTML = orderBookLastUpdatePassed[exchangeA] + " ms";
        document.getElementById("exchangeB_OrderBookLastUpdatePassed").innerHTML = orderBookLastUpdatePassed[exchangeB] + " ms";


        await delay(100);
    }
}

//callbacks
function binanceGetPriceCB(resBody)
{
    if(!resBody)
    {
        binanceGetPriceRespondHandled = true;
        return;
    }

    closeLastUpdate["Binance"] = Date.now();

    BNB_USDT_close["Binance"] = parseFloat(resBody.price);
    
    updateClose("Binance");

    recalCloseDiff();

    binanceGetPriceRespondHandled = true;
}
function binanceGetOrderBookCB(resBody)
{
    if(!resBody)
    {
        binanceGetOrderBookRespondHandled = true;
        return;
    }

    orderBookLastUpdate["Binance"] = Date.now();

    BNB_USDT_bid["Binance"] = parseFloat(resBody.bidPrice);
    BNB_USDT_ask["Binance"] = parseFloat(resBody.askPrice);
    BNB_USDT_bidVol["Binance"] = parseFloat(resBody.bidQty);
    BNB_USDT_askVol["Binance"] = parseFloat(resBody.askQty);

    updateOrderBook("Binance");

    recalMaxProfit(orderBookLastUpdate["Binance"]);

    binanceGetOrderBookRespondHandled = true;
}

function bitmaxGetTickerCB(resBody)
{
    if(!resBody)
    {
        bitmaxGetTickerRespondHandled = true;
        return;
    }

    orderBookLastUpdate["BitMax"] = Date.now();

    BNB_USDT_close["BitMax"] = parseFloat(resBody.data.close);
    BNB_USDT_bid["BitMax"] = parseFloat(resBody.data.bid[0]);
    BNB_USDT_ask["BitMax"] = parseFloat(resBody.data.ask[0]);
    BNB_USDT_bidVol["BitMax"] = parseFloat(resBody.data.bid[1]);
    BNB_USDT_askVol["BitMax"] = parseFloat(resBody.data.ask[1]);

    updateClose("BitMax");
    updateOrderBook("BitMax");

    recalCloseDiff();
    recalMaxProfit(orderBookLastUpdate["BitMax"]);

    bitmaxGetTickerRespondHandled = true;
}

function ftxGetPriceCB(resBody)
{
    if(!resBody || resBody.success==false)
    {
        ftxGetPriceRespondHandled = true;
        return;
    }

    closeLastUpdate["FTX"] = Date.now();

    BNB_USDT_close["FTX"] = parseFloat(resBody.result.price);
    
    updateClose("FTX");

    recalCloseDiff();

    ftxGetPriceRespondHandled = true;
}
function ftxGetOrderBookCB(resBody)
{
    if(!resBody || resBody.success==false)
    {
        ftxGetOrderBookRespondHandled = true;
        return;
    }

    orderBookLastUpdate["FTX"] = Date.now();

    BNB_USDT_bid["FTX"] = parseFloat(resBody.result.bids[0][0]);
    BNB_USDT_ask["FTX"] = parseFloat(resBody.result.asks[0][0]);
    BNB_USDT_bidVol["FTX"] = parseFloat(resBody.result.bids[0][1]);
    BNB_USDT_askVol["FTX"] = parseFloat(resBody.result.asks[0][1]);

    updateOrderBook("FTX");

    recalMaxProfit(orderBookLastUpdate["FTX"]);

    ftxGetOrderBookRespondHandled = true;
}

//UI
function updateClose(exchange)
{
    const exchangeA_BNB_USDT_close = document.getElementById("exchangeA_BNB_USDT_close");
    const exchangeB_BNB_USDT_close = document.getElementById("exchangeB_BNB_USDT_close");

    if(exchange==exchangeA)
    {
        exchangeA_BNB_USDT_close.innerHTML = BNB_USDT_close[exchange].toFixed(4);
    }
    if(exchange==exchangeB)
    {
        exchangeB_BNB_USDT_close.innerHTML = BNB_USDT_close[exchange].toFixed(4);
    }
}
function updateOrderBook(exchange)
{
    const exchangeA_BNB_USDT_bid = document.getElementById("exchangeA_BNB_USDT_bid");
    const exchangeA_BNB_USDT_ask = document.getElementById("exchangeA_BNB_USDT_ask");
    const exchangeB_BNB_USDT_bid = document.getElementById("exchangeB_BNB_USDT_bid");
    const exchangeB_BNB_USDT_ask = document.getElementById("exchangeB_BNB_USDT_ask");

    if(exchange==exchangeA)
    {
        exchangeA_BNB_USDT_bid.innerHTML = BNB_USDT_bid[exchange].toFixed(4)+' / '+BNB_USDT_bidVol[exchange].toFixed(2);
        exchangeA_BNB_USDT_ask.innerHTML = BNB_USDT_ask[exchange].toFixed(4)+' / '+BNB_USDT_askVol[exchange].toFixed(2);
    }
    if(exchange==exchangeB)
    {
        exchangeB_BNB_USDT_bid.innerHTML = BNB_USDT_bid[exchange].toFixed(4)+' / '+BNB_USDT_bidVol[exchange].toFixed(2);
        exchangeB_BNB_USDT_ask.innerHTML = BNB_USDT_ask[exchange].toFixed(4)+' / '+BNB_USDT_askVol[exchange].toFixed(2);
    }
}

//recalculation
function recalCloseDiff()
{
    if(BNB_USDT_close[exchangeA] && BNB_USDT_close[exchangeB])
    {
        let diff = BNB_USDT_close[exchangeA] - BNB_USDT_close[exchangeB];
        document.getElementById("diff_BNB_USDT_close").innerHTML = (diff>=0? '+': '') + diff.toFixed(4);
    }
}
function recalMaxProfit(lastUpdate)
{
    if(BNB_USDT_bid[exchangeA] && BNB_USDT_ask[exchangeA] && BNB_USDT_bid[exchangeB] && BNB_USDT_ask[exchangeB])
    {
        ABuy_BSell = BNB_USDT_bid[exchangeB] - BNB_USDT_ask[exchangeA];
        ABuy_BSell_withFee = BNB_USDT_bid[exchangeB] * (1.0-fee[exchangeB]) - BNB_USDT_ask[exchangeA] * (1.0+fee[exchangeA]);

        ASell_BBuy = BNB_USDT_bid[exchangeA] - BNB_USDT_ask[exchangeB];
        ASell_BBuy_withFee = BNB_USDT_bid[exchangeA] * (1.0-fee[exchangeA]) - BNB_USDT_ask[exchangeB] * (1.0+fee[exchangeB]);

        if(ABuy_BSell_withFee > ASell_BBuy_withFee)
        {
            maxProfit = ABuy_BSell;
            maxProfit_withFee = ABuy_BSell_withFee;
            maxProfit_Vol = Math.min(BNB_USDT_bidVol[exchangeB], BNB_USDT_askVol[exchangeA]);
            maxProfit_direction = 'ABuy_BSell';
        }
        else
        {
            maxProfit = ASell_BBuy;
            maxProfit_withFee = ASell_BBuy_withFee;
            maxProfit_Vol = Math.min(BNB_USDT_bidVol[exchangeA], BNB_USDT_askVol[exchangeB]);
            maxProfit_direction = 'ASell_BBuy';
        }

        document.getElementById("diff_BNB_USDT_maxProfit").innerHTML = (maxProfit_withFee>=0? '+': '') + maxProfit_withFee.toFixed(4)
            +"<br/> ("+ (maxProfit>=0? '+': '') + maxProfit.toFixed(4) +")";

        traderCheckProfit();
        priceRecorderCheckProfit(lastUpdate);
    }
}



/* ------------------ Profitable Price Records ------------------ */

function priceRecorderClearUI() //clear all rows
{
    document.querySelectorAll('.tableRecordRow').forEach(e => e.remove());
}

function priceRecorderAppendUI(record)  //append as the first row
{
    if(!record || record.length < 8)
    {
        console.error("invalid price record for appending to UI: "+record);
        return;
    }

    const table = document.getElementById("tableRecord");
    let row = table.insertRow(1);
    row.className = "tableRecordRow";

    row.insertCell(0).innerHTML = dateFormat(new Date(parseInt(record[0])), "yyyy-mm-dd HH:MM:ss");

    let cell1 = row.insertCell(1);
    cell1.innerHTML = record[1]+' / '+record[2];
    cell1.className = record[7]=='ABuy_BSell'? "tdBuy":"tdSell";

    let cell2 = row.insertCell(2);
    cell2.innerHTML = record[3]+' / '+record[4];
    cell2.className = record[7]=='ASell_BBuy'? "tdBuy":"tdSell";

    row.insertCell(3).innerHTML = parseFloat(record[5]).toFixed(4)+' / '+record[6];
}

function priceRecorderLoad()
{
    let priceRecordFileDir = dataDir+exchangeA+exchangeB+priceRecordFile;

    if(fileIOInterface.checkDirSync(priceRecordFileDir))
        fileIOInterface.readCSVRecords(priceRecordFileDir, priceRecorderLoadCallback);
}

function priceRecorderLoadCallback(records)
{
    records.forEach(function(record) { priceRecorderAppendUI(record); });
}

function priceRecorderCheckProfit(lastUpdate)
{
    const priceRecorderCriticalMaxProfitWithFee = document.getElementById("priceRecorderCriticalMaxProfitWithFee");
    let priceRecorderCriticalMaxProfitWithFeeValue = parseFloat(priceRecorderCriticalMaxProfitWithFee.value);

    const priceRecorderMaxLastUpdate = document.getElementById("priceRecorderMaxLastUpdate");
    let priceRecorderMaxLastUpdateValue = parseFloat(priceRecorderMaxLastUpdate.value);

    let currentTime = Date.now();

    if(maxProfit_withFee && maxProfit_direction && maxProfit_Vol &&
        maxProfit_withFee >= priceRecorderCriticalMaxProfitWithFeeValue &&
        Math.abs(currentTime - orderBookLastUpdate[exchangeA]) <= priceRecorderMaxLastUpdateValue && 
        Math.abs(currentTime - orderBookLastUpdate[exchangeB]) <= priceRecorderMaxLastUpdateValue)
    {
        let newRecord;

        if(maxProfit_direction === 'ABuy_BSell')
            newRecord = [lastUpdate, BNB_USDT_ask[exchangeA], BNB_USDT_askVol[exchangeA], BNB_USDT_bid[exchangeB], BNB_USDT_bidVol[exchangeB], maxProfit_withFee, maxProfit_Vol, maxProfit_direction];
        else
            newRecord = [lastUpdate, BNB_USDT_bid[exchangeA], BNB_USDT_bidVol[exchangeA], BNB_USDT_ask[exchangeB], BNB_USDT_askVol[exchangeB], maxProfit_withFee, maxProfit_Vol, maxProfit_direction];

        priceRecorderAppendUI(newRecord);
        fileIOInterface.appendRecordSync(dataDir+exchangeA+exchangeB+priceRecordFile, newRecord);
    }
}



/* ------------------ Trade History ------------------ */

let traderActive = false;
function toggleTrader()
{
    testTrade()
    // traderActive = !traderActive;
    // traderTrading = false;

    // const toggleTraderBtn = document.getElementById("toggleTraderBtn");
    // toggleTraderBtn.innerHTML = traderActive? "Stop trading" : "Start trading";
}

function tradeHistoryUI(trade)  //append as the first row, or update row
{
    if(!trade || trade.length < 9)
    {
        console.error("invalid trade history for appending to or updating UI: "+trade);
        return;
    }

    let existingRow = document.getElementById(trade[0]);

    if(existingRow)
    {
        //update
        existingRow.cells[4].innerHTML = parseFloat(trade[6]).toFixed(4)+' / '+parseFloat(trade[7]).toFixed(4);
        existingRow.cells[5].innerHTML = trade[8];
    }
    else
    {
        //append
        const table = document.getElementById("tableHistory");

        let row = table.insertRow(1);
        row.className = "tableTradeRow";
        row.id = trade[0];

        row.insertCell(0).innerHTML = dateFormat(new Date(parseInt(trade[1])), "yyyy-mm-dd HH:MM:ss");
        row.insertCell(1).innerHTML = trade[2];

        let cell2 = row.insertCell(2);
        cell2.innerHTML = trade[3];
        cell2.className = trade[3] == "BUY"? "tdBuy" : "tdSell";

        row.insertCell(3).innerHTML = parseFloat(trade[4]).toFixed(4)+' / '+parseFloat(trade[5]).toFixed(4);
        row.insertCell(4).innerHTML = parseFloat(trade[6]).toFixed(4)+' / '+parseFloat(trade[7]).toFixed(4);
        row.insertCell(5).innerHTML = trade[8];
    }
}

function tradeHistoryLoad()
{
    let tradeHistoryFileDir = dataDir+tradeHistoryFile;

    if(fileIOInterface.checkDirSync(tradeHistoryFileDir))
        fileIOInterface.readJSONSync(tradeHistoryFileDir, tradeHistoryLoadCallback);
}

function tradeHistoryLoadCallback(trades)
{
    tradeHistory = trades;

    for (const [key, trade] of Object.entries(tradeHistory))
    {
        let time = trade.transactTime? trade.transactTime : trade.time;
        let loadRecord = [key, time, "Binance", trade.side, trade.price, trade.origQty, (trade.cummulativeQuoteQty/trade.executedQty), trade.executedQty, trade.status];
        tradeHistoryUI(loadRecord);
    }
}

function traderCheckProfit()
{
    if(!traderActive) return;

    // console.log("maxProfit_withFee: "+maxProfit_withFee);
    // console.log("maxProfit_direction: "+maxProfit_direction);
    // console.log("maxProfit_Vol: "+maxProfit_Vol);
    // console.log("ac_BNB[exchangeA] + ac_BNB[exchangeB]: "+(ac_BNB[exchangeA] + ac_BNB[exchangeB]));
    // console.log("ac_USDT[exchangeA] + ac_USDT[exchangeB]: "+(ac_USDT[exchangeA] + ac_USDT[exchangeB]));

    const traderCriticalMaxProfitWithFee = document.getElementById("traderCriticalMaxProfitWithFee");
    let traderCriticalMaxProfitWithFeeValue = parseFloat(traderCriticalMaxProfitWithFee.value);

    const traderMaxLastUpdate = document.getElementById("traderMaxLastUpdate");
    let traderMaxLastUpdateValue = parseFloat(traderMaxLastUpdate.value);

    let currentTime = Date.now();

    if(maxProfit_withFee && maxProfit_direction && maxProfit_Vol &&     //best deal data ready
        (ac_BNB[exchangeA] + ac_BNB[exchangeB]) && (ac_USDT[exchangeA] + ac_USDT[exchangeB]) &&     //account balance consists of both coins
        maxProfit_withFee >= traderCriticalMaxProfitWithFeeValue &&     //deal is good enough
        Math.abs(currentTime - orderBookLastUpdate[exchangeA]) <= traderMaxLastUpdateValue &&      //data is fresh
        Math.abs(currentTime - orderBookLastUpdate[exchangeB]) <= traderMaxLastUpdateValue)
    {
        traderTrade();
    }
}

let traderTrading = false;
let binancePostOrderHandled = false, bitmaxPostOrderHandled = false;
let binancePostedOrderId = '', bitmaxPostedOrderId = '';
let binancePostOrderFilled = false, bitmaxPostOrderFilled = false;
async function traderTrade()
{
    if(traderTrading) return;
    traderTrading = true;
    binancePostOrderHandled = bitmaxPostOrderHandled = false;
    binancePostedOrderId = bitmaxPostedOrderId = '';
    binancePostOrderFilled = bitmaxPostOrderFilled = false;



    //sides
    let binanceSide = maxProfit_direction == 'ABuy_BSell' ? "BUY" : "SELL";
    let bitmaxSide = maxProfit_direction == 'ASell_BBuy' ? "BUY" : "SELL";

    /* employ safe trading, which raise buy price and lower sell price, each by half of the (max profit * buffer%)
       if both order are executed exactly at the safe trading price with 50% buffer, the resulting gain would be about +/-0
       this could allow the orders to be fulfilled even if the best prices have shifted a little bit against us */

    const traderSafeTradeBuffer = document.getElementById("traderSafeTradeBuffer");
    let safeTradeBuffer = maxProfit_withFee * (parseFloat(traderSafeTradeBuffer.value)/100.0) /2.0;

    //prices
    let binancePrice = maxProfit_direction == 'ABuy_BSell' ? BNB_USDT_ask[exchangeA]+safeTradeBuffer : BNB_USDT_bid[exchangeA]-safeTradeBuffer;
    let bitmaxPrice = maxProfit_direction == 'ASell_BBuy' ? BNB_USDT_ask[exchangeB]+safeTradeBuffer : BNB_USDT_bid[exchangeB]-safeTradeBuffer;
    binancePrice = Math.round10(binancePrice, -4);  //Binance BNB: Min Price Movement = 0.0001 USDT
    bitmaxPrice = Math.round10(bitmaxPrice, -4);

    //quantities
    let binanceAffordable = maxProfit_direction == 'ABuy_BSell' ? ac_USDT[exchangeA]/binancePrice : ac_BNB[exchangeA];
    let bitmaxQuantity = maxProfit_direction == 'ASell_BBuy' ? ac_USDT[exchangeB]/bitmaxPrice : ac_BNB[exchangeB];
    let quantity = Math.floor10(Math.min(binanceAffordable, bitmaxQuantity, maxProfit_Vol), -2);    //round down quantity, BitMax & FTX accept 2 decimal places quantity
    if(quantity<=0.05) //Binance BNB: Minimum Trade Amount 0.001 BNB, Minimum Order Size 10 USDT
    {
        traderTrading = false;
        return;
    }

    console.log('binanceSide: '+binanceSide);
    console.log('bitmaxSide: '+bitmaxSide);
    console.log('binancePrice: '+binancePrice);
    console.log('bitmaxPrice: '+bitmaxPrice);
    console.log('quantity: '+quantity);


    //Binance
    let parmsBinance = {
        symbol: "BNBUSDT",
        side: "SELL",
        type: "LIMIT",
        timeInForce: "GTC", //GTC (Good-Til-Canceled) orders are effective until they are executed or canceled.
        quantity: 0.1,
        price: 300,
        // newClientOrderId: "ATM_generated_order_1"
    };
    binanceInterface.postOrder(parmsBinance, binancePostOrderCB);



    //Bitmax
    let parmsBitmax = {
        symbol: "BNB/USDT",
        side: "sell",
        orderType: "limit",
        orderQty: "0.1",
        orderPrice: "300",
        // id: "ATM_generated_order_1"
    };
    bitmaxInterface.postOrder(parmsBitmax, bitmaxPostOrderCB);




    //waiting for server responses
    while((!binancePostOrderHandled || !bitmaxPostOrderHandled) && traderActive)
    {
        // if time > sth, show possible failure, add it to record and ask for intervention

        await delay(100);
    }



    //check for acceptance
    let dialogMsg = '';
    let mutualAcceptance = true;
    if(!binancePostedOrderId)
    {
        //show failure, stop trading
        dialogMsg += "Biance post order failed. Please manually confirm the orders.<br/>";
        mutualAcceptance = false;
    }
    if(!bitmaxPostedOrderId)
    {
        //show failure, stop trading
        dialogMsg += "BitMmax post order failed. Please manually confirm the orders.<br/>";
        mutualAcceptance = false;
    }

    if(!mutualAcceptance)
    {
        showModalBox(dialogMsg);
        if(traderActive) toggleTrader();
        return;
    }


    //waiting for order to be filled
    while((!binancePostOrderFilled || !bitmaxGetOrderFilled) && traderActive)
    {
        // check Binance order
        let parms = {
            symbol: "BNBUSDT",
            orderId: binancePostedOrderId
        };
        binanceInterface.getOrder(parms, binanceGetOrderCB);

        // check BitMax order



        // if time > sth, show possible failure, add it to record and ask for intervention

        await delay(1000);
    }



    traderTrading = false;
}

function binancePostOrderCB(resBody)
{
    console.log('binancePostOrderCB: ')
    console.log(resBody)

    if(resBody && !resBody.code)
    {
        binancePostedOrderId = resBody.clientOrderId;
        tradeHistory[binancePostedOrderId] = resBody;

        let newRecord = [binancePostedOrderId, resBody.transactTime, "Binance", resBody.side, resBody.price, resBody.origQty, resBody.cummulativeQuoteQty/resBody.executedQty, resBody.executedQty, resBody.status];
        tradeHistoryUI(newRecord);
    }
    else
    {
        console.error("Biance post order failed");
        console.error(resBody);
    }

    binancePostOrderHandled = true;
}

function bitmaxPostOrderCB(resBody)
{
    console.log('bitmaxPostOrderCB: ')
    console.log(resBody)

    if(resBody && !resBody.code)
    {
        // bitmaxPostedOrderId = resBody.clientOrderId;
        // tradeHistory[bitmaxPostedOrderId] = resBody;
    }
    else
    {
        console.error("Bitmax post order failed");
        console.error(resBody);
    }

    bitmaxPostOrderHandled = true;
}

function binanceGetOrderCB(resBody)
{
    console.log('binanceGetOrderCB: ')
    console.log(resBody)

    if(resBody && !resBody.code)
    {
        orderId = resBody.clientOrderId;
        tradeHistory[orderId] = resBody;

        let updateRecord = [orderId, resBody.time, "Binance", resBody.side, resBody.price, resBody.origQty, resBody.cummulativeQuoteQty/resBody.executedQty, resBody.executedQty, resBody.status];
        tradeHistoryUI(updateRecord);

        if(orderId == binancePostedOrderId)
        {
            binancePostOrderFilled = (resBody.status == "FILLED");
        }
    }
    else
    {
        console.error("Biance get order failed");
        console.error(resBody);
    }
}










async function testTrade()
{
    //Binance
    let parmsBinance = {
        symbol: "BNBUSDT",
        side: "SELL",
        type: "LIMIT",
        timeInForce: "GTC", //GTC (Good-Til-Canceled) orders are effective until they are executed or canceled.
        quantity: 0.1,
        price: 400,
        // newClientOrderId: "ATM_generated_order_1"
    };
    binanceInterface.postOrder(parmsBinance, binancePostOrderCB);

    //waiting for server responses
    while(!binancePostOrderHandled)
    {
        // if time > sth, show possible failure, add it to record and ask for intervention

        await delay(100);
    }

    await delay(1000);

    // check Binance order
    let parms = {
        symbol: "BNBUSDT",
        origClientOrderId: binancePostedOrderId
    };
    binanceInterface.getOrder(parms, binanceGetOrderCB);
}