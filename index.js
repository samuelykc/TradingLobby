const { ipcRenderer } = require('electron');
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
let ac_BNB = {};
let ac_USDT = {};

let walletLastUpdate = {};  //timestamp
walletLastUpdate["Binance"] = 0;
walletLastUpdate["BitMax"] = 0;
walletLastUpdate["FTX"] = 0;


/* ------------------ BNB/USDT Market ------------------ */
let exchangeA_BNB_USDT_close, exchangeA_BNB_USDT_bid, exchangeA_BNB_USDT_ask, exchangeA_BNB_USDT_bidVol, exchangeA_BNB_USDT_askVol;
let exchangeB_BNB_USDT_close, exchangeB_BNB_USDT_bid, exchangeB_BNB_USDT_ask, exchangeB_BNB_USDT_bidVol, exchangeB_BNB_USDT_askVol;

let ABuy_BSell, ABuy_BSell_withFee;
let ASell_BBuy, ASell_BBuy_withFee;
let maxProfit, maxProfit_withFee, maxProfit_Vol, maxProfit_direction;

let Binance_PriceLastUpdate = 0, Binance_OrderBookLastUpdate = 0, BitMax_OrderBookLastUpdate = 0;  //timestamp


/* ------------------ Profitable Price Records ------------------ */
const priceRecordFile = "priceRecord.csv";


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

async function asyncAccountFetcher() {
    while(operating)
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
        let exchangeA_WalletLastUpdatePassed = Math.abs(currentTime - walletLastUpdate[exchangeA]);
        let exchangeB_WalletLastUpdatePassed = Math.abs(currentTime - walletLastUpdate[exchangeB]);

        //show time
        document.getElementById("exchangeA_WalletLastUpdatePassed").innerHTML = exchangeA_WalletLastUpdatePassed + " ms";
        document.getElementById("exchangeB_WalletLastUpdatePassed").innerHTML = exchangeB_WalletLastUpdatePassed + " ms";

        //resume from failed respond waiting
        if(!binanceGetWalletAllCoinRespondHandled && exchangeA_WalletLastUpdatePassed > 1000) binanceGetWalletAllCoinRespondHandled = true;
        if(!bitmaxGetWalletAllCoinRespondHandled && exchangeB_WalletLastUpdatePassed > 1000) bitmaxGetWalletAllCoinRespondHandled = true;
        
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

async function asyncMarketFetcher() {
    while(operating)
    {
        //calculate time since last update
        let currentTime = Date.now();
        let Binance_PriceLastUpdatePassed = currentTime - Binance_PriceLastUpdate;
        let Binance_OrderBookLastUpdatePassed = currentTime - Binance_OrderBookLastUpdate;
        let BitMax_OrderBookLastUpdatePassed = currentTime - BitMax_OrderBookLastUpdate;

        //Binance
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

        //Bitmax
        if(bitmaxGetTickerRespondHandled)
        {
            bitmaxGetTickerRespondHandled = false;

            const parms = {
                symbol: "BNB/USDT"
            };
            bitmaxInterface.getTicker(parms, bitmaxGetTickerCB);
        }
        
        //show time
        document.getElementById("Binance_OrderBookLastUpdatePassed").innerHTML = Binance_OrderBookLastUpdatePassed + " ms";
        document.getElementById("BitMax_OrderBookLastUpdatePassed").innerHTML = BitMax_OrderBookLastUpdatePassed + " ms";

        //resume from failed respond waiting
        if(!binanceGetPriceRespondHandled && Binance_PriceLastUpdatePassed > 2000) binanceGetPriceRespondHandled = true;
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

    exchangeA_BNB_USDT_close = parseFloat(resBody.price);
    
    document.getElementById("exchangeA_BNB_USDT_close").innerHTML = exchangeA_BNB_USDT_close.toFixed(4);

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

    exchangeA_BNB_USDT_bid = parseFloat(resBody.bidPrice);
    exchangeA_BNB_USDT_ask = parseFloat(resBody.askPrice);
    exchangeA_BNB_USDT_bidVol = parseFloat(resBody.bidQty);
    exchangeA_BNB_USDT_askVol = parseFloat(resBody.askQty);

    document.getElementById("exchangeA_BNB_USDT_bid").innerHTML = exchangeA_BNB_USDT_bid.toFixed(4)+' / '+exchangeA_BNB_USDT_bidVol.toFixed(2);
    document.getElementById("exchangeA_BNB_USDT_ask").innerHTML = exchangeA_BNB_USDT_ask.toFixed(4)+' / '+exchangeA_BNB_USDT_askVol.toFixed(2);

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

    exchangeB_BNB_USDT_close = parseFloat(resBody.data.close);
    exchangeB_BNB_USDT_bid = parseFloat(resBody.data.bid[0]);
    exchangeB_BNB_USDT_ask = parseFloat(resBody.data.ask[0]);
    exchangeB_BNB_USDT_bidVol = parseFloat(resBody.data.bid[1]);
    exchangeB_BNB_USDT_askVol = parseFloat(resBody.data.ask[1]);

    document.getElementById("exchangeB_BNB_USDT_close").innerHTML = exchangeB_BNB_USDT_close.toFixed(4);
    document.getElementById("exchangeB_BNB_USDT_bid").innerHTML = exchangeB_BNB_USDT_bid.toFixed(4)+' / '+exchangeB_BNB_USDT_bidVol.toFixed(2);
    document.getElementById("exchangeB_BNB_USDT_ask").innerHTML = exchangeB_BNB_USDT_ask.toFixed(4)+' / '+exchangeB_BNB_USDT_askVol.toFixed(2);

    recalCloseDiff();
    recalMaxProfit(BitMax_OrderBookLastUpdate);

    bitmaxGetTickerRespondHandled = true;
}

//recalculation
function recalCloseDiff()
{
    if(exchangeA_BNB_USDT_close && exchangeB_BNB_USDT_close)
    {
        let diff = exchangeA_BNB_USDT_close - exchangeB_BNB_USDT_close;
        document.getElementById("diff_BNB_USDT_close").innerHTML = (diff>=0? '+': '') + diff.toFixed(4);
    }
}
function recalMaxProfit(lastUpdate)
{
    if(exchangeA_BNB_USDT_bid && exchangeA_BNB_USDT_ask && exchangeB_BNB_USDT_bid && exchangeB_BNB_USDT_ask)
    {
        ABuy_BSell = exchangeB_BNB_USDT_bid - exchangeA_BNB_USDT_ask;
        ABuy_BSell_withFee = exchangeB_BNB_USDT_bid * (1.0-BitMax_fee) - exchangeA_BNB_USDT_ask * (1.0+Binance_fee);

        ASell_BBuy = exchangeA_BNB_USDT_bid - exchangeB_BNB_USDT_ask;
        ASell_BBuy_withFee = exchangeA_BNB_USDT_bid * (1.0-Binance_fee) - exchangeB_BNB_USDT_ask * (1.0+BitMax_fee);

        if(ABuy_BSell_withFee > ASell_BBuy_withFee)
        {
            maxProfit = ABuy_BSell;
            maxProfit_withFee = ABuy_BSell_withFee;
            maxProfit_Vol = Math.min(exchangeB_BNB_USDT_bidVol, exchangeA_BNB_USDT_askVol);
            maxProfit_direction = 'ABuy_BSell';
        }
        else
        {
            maxProfit = ASell_BBuy;
            maxProfit_withFee = ASell_BBuy_withFee;
            maxProfit_Vol = Math.min(exchangeA_BNB_USDT_bidVol, exchangeB_BNB_USDT_askVol);
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

        if(maxProfit_direction === 'ABuy_BSell')
            newRecord = [lastUpdate, exchangeA_BNB_USDT_ask, exchangeA_BNB_USDT_askVol, exchangeB_BNB_USDT_bid, exchangeB_BNB_USDT_bidVol, maxProfit_withFee, maxProfit_Vol, maxProfit_direction];
        else
            newRecord = [lastUpdate, exchangeA_BNB_USDT_bid, exchangeA_BNB_USDT_bidVol, exchangeB_BNB_USDT_ask, exchangeB_BNB_USDT_askVol, maxProfit_withFee, maxProfit_Vol, maxProfit_direction];

        priceRecorderAppendUI(newRecord);
        fileIOInterface.appendRecordSync(dataDir+priceRecordFile, newRecord);
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
        Math.abs(currentTime - Binance_OrderBookLastUpdate) <= traderMaxLastUpdateValue &&      //data is fresh
        Math.abs(currentTime - BitMax_OrderBookLastUpdate) <= traderMaxLastUpdateValue)
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
    let binancePrice = maxProfit_direction == 'ABuy_BSell' ? exchangeA_BNB_USDT_ask+safeTradeBuffer : exchangeA_BNB_USDT_bid-safeTradeBuffer;
    let bitmaxPrice = maxProfit_direction == 'ASell_BBuy' ? exchangeB_BNB_USDT_ask+safeTradeBuffer : exchangeB_BNB_USDT_bid-safeTradeBuffer;
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