const { ipcRenderer } = require('electron')

const binanceInterface = require('./js/binanceInterface');
const bitmaxInterface = require('./js/bitmaxInterface');
const fileIOInterface = require('./js/fileIOInterface');
const mathExtend = require('./js/mathExtend');

const dateFormat = require('dateformat');



const dataDir = "data/";
fileIOInterface.makeDirSync(dataDir);

const configFile = "config.txt";


let Binance_fee = 0.001;
let BitMax_fee = 0.001;


/* ------------------ Account Balance ------------------ */
let ac_Binance_BNB, ac_Binance_USDT;
let ac_BitMax_BNB, ac_BitMax_USDT;

let Binance_WalletLastUpdate, BitMax_WalletLastUpdate;  //timestamp


/* ------------------ BNB/USDT Market ------------------ */
let Binance_BNB_USDT_close, Binance_BNB_USDT_bid, Binance_BNB_USDT_ask, Binance_BNB_USDT_bidVol, Binance_BNB_USDT_askVol;
let BitMax_BNB_USDT_close, BitMax_BNB_USDT_bid, BitMax_BNB_USDT_ask, BitMax_BNB_USDT_bidVol, BitMax_BNB_USDT_askVol;

let BinanceBuy_BitMaxSell, BinanceBuy_BitMaxSell_withFee;
let BinanceSell_BitMaxBuy, BinanceSell_BitMaxBuy_withFee;
let maxProfit, maxProfit_withFee, maxProfit_Vol, maxProfit_direction;

let Binance_PriceLastUpdate, Binance_OrderBookLastUpdate, BitMax_OrderBookLastUpdate;  //timestamp


/* ------------------ Profitable Price Records ------------------ */
// let priceRecorderCriticalMaxProfitWithFee = 0;
// let priceRecorderMaxLastUpdate = 1000;  //ms

const priceRecordFile = "priceRecord.csv";


/* ------------------ Trade History ------------------ */
// let traderCriticalMaxProfitWithFee = 0;
// let traderMaxLastUpdate = 1000;  //ms

const tradeHistoryFile = "tradeHistory.csv";







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
}






//once the window is ready, loop the fetchers
window.onload = function()
{
    priceRecorderLoad();
    tradeHistoryLoad();

    asyncAccountFetcher();
    asyncMarketFetcher();
};






function delay(t, val) {
   return new Promise(function(resolve) {
       setTimeout(function() {
           resolve(val);
       }, t);
   });
}






/* ------------------ Account Balance ------------------ */
let binanceGetWalletAllCoinRespondHandled = true;
let bitmaxGetWalletAllCoinRespondHandled = true;

async function asyncAccountFetcher() {
    while(true)
    {
        if(binanceGetWalletAllCoinRespondHandled)
        {
            binanceGetWalletAllCoinRespondHandled = false;

            binanceInterface.getWalletAllCoin(binanceGetWalletAllCoinCB);
        }

        if(bitmaxGetWalletAllCoinRespondHandled)
        {
            bitmaxGetWalletAllCoinRespondHandled = false;

            bitmaxInterface.getWalletAllCoin(bitmaxGetWalletAllCoinCB);
        }

        //calculate time since last update
        let currentTime = Date.now();
        let Binance_WalletLastUpdatePassed = Math.abs(currentTime - Binance_WalletLastUpdate);
        let BitMax_WalletLastUpdatePassed = Math.abs(currentTime - BitMax_WalletLastUpdate);

        //show time
        document.getElementById("Binance_WalletLastUpdatePassed").innerHTML = Binance_WalletLastUpdatePassed + " ms";
        document.getElementById("BitMax_WalletLastUpdatePassed").innerHTML = BitMax_WalletLastUpdatePassed + " ms";

        //resume from failed respond waiting
        if(!binanceGetWalletAllCoinRespondHandled && Binance_WalletLastUpdatePassed > 1000) binanceGetWalletAllCoinRespondHandled = true;
        if(!bitmaxGetWalletAllCoinRespondHandled && BitMax_WalletLastUpdatePassed > 1000) bitmaxGetWalletAllCoinRespondHandled = true;
        
        await delay(1000);
    }
}

//callbacks
function binanceGetWalletAllCoinCB(resBody)
{
    if(resBody)
    {
        Binance_WalletLastUpdate = Date.now();

        ac_Binance_BNB = parseFloat(resBody.find(e => e.coin === "BNB").free);
        ac_Binance_USDT = parseFloat(resBody.find(e => e.coin === "USDT").free);

        document.getElementById("ac_Binance_BNB").innerHTML = ac_Binance_BNB.toFixed(4);
        document.getElementById("ac_Binance_USDT").innerHTML = ac_Binance_USDT.toFixed(4);

        recalAcSum();
    }

    binanceGetWalletAllCoinRespondHandled = true;
}

function bitmaxGetWalletAllCoinCB(resBody)
{
    if(resBody)
    {
        BitMax_WalletLastUpdate = Date.now();

        let BNB_record = resBody.data.find(e => e.asset === "BNB");
        let USDT_record = resBody.data.find(e => e.asset === "USDT");

        ac_BitMax_BNB = BNB_record? parseFloat(BNB_record.totalBalance) : 0;
        ac_BitMax_USDT = USDT_record? parseFloat(USDT_record.totalBalance): 0;

        document.getElementById("ac_BitMax_BNB").innerHTML = ac_BitMax_BNB.toFixed(4);
        document.getElementById("ac_BitMax_USDT").innerHTML = ac_BitMax_USDT.toFixed(4);

        recalAcSum();
    }

    bitmaxGetWalletAllCoinRespondHandled = true;
}

//recalculation
function recalAcSum()
{
    if((ac_Binance_BNB||ac_Binance_BNB==0) && (ac_BitMax_BNB||ac_BitMax_BNB==0))
    {
        let sum = ac_Binance_BNB + ac_BitMax_BNB;
        document.getElementById("ac_sum_BNB").innerHTML = sum.toFixed(4);
    }
    if((ac_Binance_USDT||ac_Binance_USDT==0) && (ac_BitMax_USDT||ac_BitMax_USDT==0))
    {
        let sum = ac_Binance_USDT + ac_BitMax_USDT;
        document.getElementById("ac_sum_USDT").innerHTML = sum.toFixed(4);
    }
}




/* ------------------ BNB/USDT Market ------------------ */
let binanceGetPriceRespondHandled = true;
let binanceGetOrderBookRespondHandled = true;

let bitmaxGetTickerRespondHandled = true;

async function asyncMarketFetcher() {
    while(true)
    {
        //Binance
        if(binanceGetPriceRespondHandled)
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

        //Bitmax
        if(bitmaxGetTickerRespondHandled)
        {
            bitmaxGetTickerRespondHandled = false;

            const parms = {
                symbol: "BNB/USDT"
            };
            bitmaxInterface.getTicker(parms, bitmaxGetTickerCB);
        }

        //calculate time since last update
        let currentTime = Date.now();
        let Binance_PriceLastUpdatePassed = Math.abs(currentTime - Binance_PriceLastUpdate);
        let Binance_OrderBookLastUpdatePassed = Math.abs(currentTime - Binance_OrderBookLastUpdate);
        let BitMax_OrderBookLastUpdatePassed = Math.abs(currentTime - BitMax_OrderBookLastUpdate);

        //show time
        document.getElementById("Binance_OrderBookLastUpdatePassed").innerHTML = Binance_OrderBookLastUpdatePassed + " ms";
        document.getElementById("BitMax_OrderBookLastUpdatePassed").innerHTML = BitMax_OrderBookLastUpdatePassed + " ms";

        //resume from failed respond waiting
        if(!binanceGetPriceRespondHandled && Binance_PriceLastUpdatePassed > 1000) binanceGetPriceRespondHandled = true;
        if(!binanceGetOrderBookRespondHandled && Binance_OrderBookLastUpdatePassed > 1000) binanceGetOrderBookRespondHandled = true;
        if(!bitmaxGetTickerRespondHandled && BitMax_OrderBookLastUpdatePassed > 1000) bitmaxGetTickerRespondHandled = true;

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

    Binance_PriceLastUpdate = Date.now();

    Binance_BNB_USDT_close = parseFloat(resBody.price);
    
    document.getElementById("Binance_BNB_USDT_close").innerHTML = Binance_BNB_USDT_close.toFixed(4);

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

    Binance_OrderBookLastUpdate = Date.now();

    Binance_BNB_USDT_bid = parseFloat(resBody.bidPrice);
    Binance_BNB_USDT_ask = parseFloat(resBody.askPrice);
    Binance_BNB_USDT_bidVol = parseFloat(resBody.bidQty);
    Binance_BNB_USDT_askVol = parseFloat(resBody.askQty);

    document.getElementById("Binance_BNB_USDT_bid").innerHTML = Binance_BNB_USDT_bid.toFixed(4)+' / '+Binance_BNB_USDT_bidVol.toFixed(2);
    document.getElementById("Binance_BNB_USDT_ask").innerHTML = Binance_BNB_USDT_ask.toFixed(4)+' / '+Binance_BNB_USDT_askVol.toFixed(2);

    recalMaxProfit(Binance_OrderBookLastUpdate);

    binanceGetOrderBookRespondHandled = true;
}

function bitmaxGetTickerCB(resBody)
{
    if(!resBody)
    {
        bitmaxGetTickerRespondHandled = true;
        return;
    }

    BitMax_OrderBookLastUpdate = Date.now();

    BitMax_BNB_USDT_close = parseFloat(resBody.data.close);
    BitMax_BNB_USDT_bid = parseFloat(resBody.data.bid[0]);
    BitMax_BNB_USDT_ask = parseFloat(resBody.data.ask[0]);
    BitMax_BNB_USDT_bidVol = parseFloat(resBody.data.bid[1]);
    BitMax_BNB_USDT_askVol = parseFloat(resBody.data.ask[1]);

    document.getElementById("BitMax_BNB_USDT_close").innerHTML = BitMax_BNB_USDT_close.toFixed(4);
    document.getElementById("BitMax_BNB_USDT_bid").innerHTML = BitMax_BNB_USDT_bid.toFixed(4)+' / '+BitMax_BNB_USDT_bidVol.toFixed(2);
    document.getElementById("BitMax_BNB_USDT_ask").innerHTML = BitMax_BNB_USDT_ask.toFixed(4)+' / '+BitMax_BNB_USDT_askVol.toFixed(2);

    recalCloseDiff();
    recalMaxProfit(BitMax_OrderBookLastUpdate);

    bitmaxGetTickerRespondHandled = true;
}

//recalculation
function recalCloseDiff()
{
    if(Binance_BNB_USDT_close && BitMax_BNB_USDT_close)
    {
        let diff = Binance_BNB_USDT_close - BitMax_BNB_USDT_close;
        document.getElementById("diff_BNB_USDT_close").innerHTML = (diff>=0? '+': '') + diff.toFixed(4);
    }
}
function recalMaxProfit(lastUpdate)
{
    if(Binance_BNB_USDT_bid && Binance_BNB_USDT_ask && BitMax_BNB_USDT_bid && BitMax_BNB_USDT_ask)
    {
        BinanceBuy_BitMaxSell = BitMax_BNB_USDT_bid - Binance_BNB_USDT_ask;
        BinanceBuy_BitMaxSell_withFee = BitMax_BNB_USDT_bid * (1.0-BitMax_fee) - Binance_BNB_USDT_ask * (1.0+Binance_fee);

        BinanceSell_BitMaxBuy = Binance_BNB_USDT_bid - BitMax_BNB_USDT_ask;
        BinanceSell_BitMaxBuy_withFee = Binance_BNB_USDT_bid * (1.0-Binance_fee) - BitMax_BNB_USDT_ask * (1.0+BitMax_fee);

        if(BinanceBuy_BitMaxSell_withFee > BinanceSell_BitMaxBuy_withFee)
        {
            maxProfit = BinanceBuy_BitMaxSell;
            maxProfit_withFee = BinanceBuy_BitMaxSell_withFee;
            maxProfit_Vol = Math.min(BitMax_BNB_USDT_bidVol, Binance_BNB_USDT_askVol);
            maxProfit_direction = 'BinanceBuy_BitMaxSell';
        }
        else
        {
            maxProfit = BinanceSell_BitMaxBuy;
            maxProfit_withFee = BinanceSell_BitMaxBuy_withFee;
            maxProfit_Vol = Math.min(Binance_BNB_USDT_bidVol, BitMax_BNB_USDT_askVol);
            maxProfit_direction = 'BinanceSell_BitMaxBuy';
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
    if(!record || record.length < 7)
    {
        console.error("invalid price record for appending to UI: "+record);
        return;
    }

    const table = document.getElementById("tableRecord");
    let row = table.insertRow(1);
    row.className = "tableRecordRow";
    row.insertCell(0).innerHTML = dateFormat(new Date(parseInt(record[0])), "yyyy-mm-dd HH:MM:ss");
    row.insertCell(1).innerHTML = record[1]+' / '+record[2];
    row.insertCell(2).innerHTML = record[3]+' / '+record[4];
    row.insertCell(3).innerHTML = parseFloat(record[5]).toFixed(4)+' / '+record[6];
}

function priceRecorderLoad()
{
    let priceRecordFileDir = dataDir+priceRecordFile;

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
        Math.abs(currentTime - Binance_OrderBookLastUpdate) <= priceRecorderMaxLastUpdateValue && 
        Math.abs(currentTime - BitMax_OrderBookLastUpdate) <= priceRecorderMaxLastUpdateValue)
    {
        let newRecord;

        if(maxProfit_direction === 'BinanceBuy_BitMaxSell')
            newRecord = [lastUpdate, Binance_BNB_USDT_ask, Binance_BNB_USDT_askVol, BitMax_BNB_USDT_bid, BitMax_BNB_USDT_bidVol, maxProfit_withFee, maxProfit_Vol, maxProfit_direction];
        else
            newRecord = [lastUpdate, Binance_BNB_USDT_bid, Binance_BNB_USDT_bidVol, BitMax_BNB_USDT_ask, BitMax_BNB_USDT_askVol, maxProfit_withFee, maxProfit_Vol, maxProfit_direction];

        priceRecorderAppendUI(newRecord);
        fileIOInterface.appendRecordSync(dataDir+priceRecordFile, newRecord);
    }
}



/* ------------------ Trade History ------------------ */

let traderActive = false;
function toggleTrader()
{
    traderActive = !traderActive;

    const toggleTraderBtn = document.getElementById("toggleTraderBtn");
    toggleTraderBtn.innerHTML = traderActive? "Stop trading" : "Start trading";
}

function tradeHistoryUI(trade)  //append as the first row
{
    if(!trade || trade.length < 7)
    {
        console.error("invalid trade history for appending to UI: "+trade);
        return;
    }

    const table = document.getElementById("tableTrade");
    let row = table.insertRow(1);
    row.className = "tableTradeRow";
    row.insertCell(0).innerHTML = dateFormat(new Date(parseInt(trade[0])), "yyyy-mm-dd HH:MM:ss");
    row.insertCell(1).innerHTML = trade[1]+' / '+trade[2];
    row.insertCell(2).innerHTML = trade[3]+' / '+trade[4];
    row.insertCell(3).innerHTML = parseFloat(trade[5]).toFixed(4)+' / '+trade[6];
}

function tradeHistoryLoad()
{
    let tradeHistoryFileDir = dataDir+tradeHistoryFile;

    if(fileIOInterface.checkDirSync(tradeHistoryFileDir))
        fileIOInterface.readCSVRecords(tradeHistoryFileDir, tradeHistoryLoadCallback);
}

function tradeHistoryLoadCallback(trades)
{
    trades.forEach(function(trade) { tradeHistoryUI(trade); });
}

function traderCheckProfit()
{
    if(!traderActive) return;

    console.log("maxProfit_withFee: "+maxProfit_withFee);
    console.log("maxProfit_direction: "+maxProfit_direction);
    console.log("maxProfit_Vol: "+maxProfit_Vol);
    console.log("ac_Binance_BNB + ac_BitMax_BNB: "+(ac_Binance_BNB + ac_BitMax_BNB));
    console.log("ac_Binance_USDT + ac_BitMax_USDT: "+(ac_Binance_USDT + ac_BitMax_USDT));

    const traderCriticalMaxProfitWithFee = document.getElementById("traderCriticalMaxProfitWithFee");
    let traderCriticalMaxProfitWithFeeValue = parseFloat(traderCriticalMaxProfitWithFee.value);

    const traderMaxLastUpdate = document.getElementById("traderMaxLastUpdate");
    let traderMaxLastUpdateValue = parseFloat(traderMaxLastUpdate.value);

    let currentTime = Date.now();

    if(maxProfit_withFee && maxProfit_direction && maxProfit_Vol &&     //best deal data ready
        (ac_Binance_BNB + ac_BitMax_BNB) && (ac_Binance_USDT + ac_BitMax_USDT) &&     //account balance consists of both coins
        maxProfit_withFee >= traderCriticalMaxProfitWithFeeValue &&     //deal is good enough
        Math.abs(currentTime - Binance_OrderBookLastUpdate) <= traderMaxLastUpdateValue &&      //data is fresh
        Math.abs(currentTime - BitMax_OrderBookLastUpdate) <= traderMaxLastUpdateValue)
    {
        traderTrade();
        // let newRecord;

        // if(maxProfit_direction === 'BinanceBuy_BitMaxSell')
        //     newRecord = [lastUpdate, Binance_BNB_USDT_ask, Binance_BNB_USDT_askVol, BitMax_BNB_USDT_bid, BitMax_BNB_USDT_bidVol, maxProfit_withFee, maxProfit_Vol, maxProfit_direction];
        // else
        //     newRecord = [lastUpdate, Binance_BNB_USDT_bid, Binance_BNB_USDT_bidVol, BitMax_BNB_USDT_ask, BitMax_BNB_USDT_askVol, maxProfit_withFee, maxProfit_Vol, maxProfit_direction];

        // priceRecorderAppendUI(newRecord);
        // fileIOInterface.appendRecordSync(dataDir+priceRecordFile, newRecord);
    }
}

let traderTrading = false;
let binancePostOrderHandled = false, bitmaxPostOrderHandled = false;
let binancePostOrderAccepted = false, bitmaxPostOrderAccepted = false;
let binancePostOrderFilled = false, bitmaxPostOrderFilled = false;
async function traderTrade()
{
    if(traderTrading) return;
    traderTrading = true;
    binancePostOrderHandled = bitmaxPostOrderHandled = false;
    binancePostOrderAccepted = bitmaxPostOrderAccepted = false;
    binancePostOrderFilled = bitmaxPostOrderFilled = false;



    //sides
    let binanceSide = maxProfit_direction == 'BinanceBuy_BitMaxSell' ? "BUY" : "SELL";
    let bitmaxSide = maxProfit_direction == 'BinanceSell_BitMaxBuy' ? "BUY" : "SELL";

    //prices
    let binancePrice = maxProfit_direction == 'BinanceBuy_BitMaxSell' ? Binance_BNB_USDT_ask+maxProfit_withFee/2 : Binance_BNB_USDT_bid-maxProfit_withFee/2;
    let bitmaxPrice = maxProfit_direction == 'BinanceSell_BitMaxBuy' ? BitMax_BNB_USDT_ask+maxProfit_withFee/2 : BitMax_BNB_USDT_bid-maxProfit_withFee/2;
    
    /* enfored safe trading, which raise buy price and lower sell price, each by half of the max profit
       if both order are executed exactly at the safe trading price, the resulting gain should be about +/-0
       this could allow the orders to be fulfilled even if the best prices have shifted a little bit against us */

    //quantities
    let binanceAffordable = maxProfit_direction == 'BinanceBuy_BitMaxSell' ? ac_Binance_USDT/binancePrice : ac_Binance_BNB;
    let bitmaxQuantity = maxProfit_direction == 'BinanceSell_BitMaxBuy' ? ac_BitMax_USDT/bitmaxPrice : ac_BitMax_BNB;
    let quantity = mathExtend.floor10(Math.min(binanceAffordable, bitmaxQuantity, maxProfit_Vol), -1);    //round down quantity


    console.log('binanceSide: '+binanceSide);
    console.log('bitmaxSide: '+bitmaxSide);
    console.log('binancePrice: '+binancePrice);
    console.log('bitmaxPrice: '+bitmaxPrice);
    console.log('quantity: '+quantity);

    //Binance
    const parms = {
        symbol: "BNBUSDT",
        side: "SELL",
        type: "LIMIT",
        timeInForce: "GTC", //GTC (Good-Til-Canceled) orders are effective until they are executed or canceled.
        quantity: 0.1,
        price: 300,
        newClientOrderId: "ATM_generated_order_1"
    };
    binanceInterface.postOrder(parms, binancePostOrderCB);



    //Bitmax




    //waiting for server responses
    while(!binancePostOrderHandled || !bitmaxPostOrderHandled)
    {
        // if time > sth, show possible failure, add it to record and ask for intervention

        await delay(100);
    }

    //check for acceptance
    if(!binancePostOrderAccepted)
    {
        //show failure, stop trading
    }
    if(!bitmaxPostOrderAccepted)
    {
        //show failure, stop trading
    }

    //waiting for order to be filled
    while(!binancePostOrderFilled || !bitmaxPostOrderFilled)
    {
        // check status
        // if time > sth, show possible failure, add it to record and ask for intervention

        await delay(100);
    }



    traderTrading = false;
}

function binancePostOrderCB(resBody)
{
    console.log('binancePostOrderCB: ')
    console.log(resBody)

    if(resBody && !resBody.code)
    {
        // BitMax_BNB_USDT_close = parseFloat(resBody.origQty);
        // BitMax_BNB_USDT_bid = parseFloat(resBody.data.bid[0]);
        // BitMax_BNB_USDT_ask = parseFloat(resBody.data.ask[0]);
        // BitMax_BNB_USDT_bidVol = parseFloat(resBody.data.bid[1]);
        // BitMax_BNB_USDT_askVol = parseFloat(resBody.data.ask[1]);

        // document.getElementById("BitMax_BNB_USDT_close").innerHTML = BitMax_BNB_USDT_close.toFixed(4);
        // document.getElementById("BitMax_BNB_USDT_bid").innerHTML = BitMax_BNB_USDT_bid.toFixed(4)+' / '+BitMax_BNB_USDT_bidVol.toFixed(2);
        // document.getElementById("BitMax_BNB_USDT_ask").innerHTML = BitMax_BNB_USDT_ask.toFixed(4)+' / '+BitMax_BNB_USDT_askVol.toFixed(2);

        // recalCloseDiff();
        // recalMaxProfit(BitMax_OrderBookLastUpdate);

        binancePostOrderAccepted = true;
    }
    else
    {
        console.error("Biance post order failed");
        console.error(resBody);

        binancePostOrderAccepted = false;
    }

    binancePostOrderHandled = true;
}