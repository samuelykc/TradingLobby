const { ipcRenderer } = require('electron')

const binanceInterface = require('./js/binanceInterface');
const bitmaxInterface = require('./js/bitmaxInterface');




let Binance_fee = 0.001;
let BitMax_fee = 0.001;


/* -------------- Account Balance -------------- */
let ac_Binance_BNB, ac_Binance_USDT;
let ac_BitMax_BNB, ac_BitMax_USDT;


/* -------------- BNB/USDT Market -------------- */
let Binance_BNB_USDT_close, Binance_BNB_USDT_bid, Binance_BNB_USDT_ask, Binance_BNB_USDT_bidVol, Binance_BNB_USDT_askVol;
let BitMax_BNB_USDT_close, BitMax_BNB_USDT_bid, BitMax_BNB_USDT_ask, BitMax_BNB_USDT_bidVol, BitMax_BNB_USDT_askVol;

let BinanceBuy_BitMaxSell, BinanceBuy_BitMaxSell_withFee, BinanceBuy_BitMaxSell_MaxVol;
let BinanceSell_BitMaxBuy, BinanceSell_BitMaxBuy_withFee, BinanceSell_BitMaxBuy_MaxVol;
let maxProfit, maxProfit_withFee;

let Binance_LastUpdate, BitMax_LastUpdate;


/* -------------- Trade History -------------- */






//once the window is ready, loop the fetchers
window.onload = function()
{
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



/* -------------- Account Balance -------------- */
let binanceGetWalletAllCoinResponded = true;
let bitmaxGetWalletAllCoinResponded = true;

async function asyncAccountFetcher() {
    while(true)
    {
        if(binanceGetWalletAllCoinResponded)
        {
            binanceGetWalletAllCoinResponded = false;

            binanceInterface.getWalletAllCoin(binanceGetWalletAllCoinCB)
        }

        if(bitmaxGetWalletAllCoinResponded)
        {
            bitmaxGetWalletAllCoinResponded = false;

            bitmaxInterface.getWalletAllCoin(bitmaxGetWalletAllCoinCB)
        }
            
        await delay(1000);
    }
}

//callbacks
function binanceGetWalletAllCoinCB(resBody)
{
    binanceGetWalletAllCoinResponded = true;
    if(!resBody) return;

    ac_Binance_BNB = parseFloat(resBody.find(e => e.coin === "BNB").free);
    ac_Binance_USDT = parseFloat(resBody.find(e => e.coin === "USDT").free);

    document.getElementById("ac_Binance_BNB").innerHTML = ac_Binance_BNB.toFixed(4);
    document.getElementById("ac_Binance_USDT").innerHTML = ac_Binance_USDT.toFixed(4);

    recalAcSum();
}

function bitmaxGetWalletAllCoinCB(resBody)
{
    bitmaxGetWalletAllCoinResponded = true;
    if(!resBody) return;

    let BNB_record = resBody.data.find(e => e.asset === "BNB");
    let USDT_record = resBody.data.find(e => e.asset === "USDT");

    ac_BitMax_BNB = BNB_record? parseFloat(BNB_record.totalBalance) : 0;
    ac_BitMax_USDT = USDT_record? parseFloat(USDT_record.totalBalance): 0;

    document.getElementById("ac_BitMax_BNB").innerHTML = ac_BitMax_BNB.toFixed(4);
    document.getElementById("ac_BitMax_USDT").innerHTML = ac_BitMax_USDT.toFixed(4);

    recalAcSum();
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




/* -------------- BNB/USDT Market -------------- */
let binanceGetPriceResponded = true;
let binanceGetOrderBookResponded = true;

let bitmaxGetTickerResponded = true;

async function asyncMarketFetcher() {
    while(true)
    {
        //Binance
        if(binanceGetPriceResponded)
        {
            binanceGetPriceResponded = false;
            
            const parms = {
                symbol: "BNBUSDT"
            }
            binanceInterface.getPrice(parms, binanceGetPriceCB)
        }
        if(binanceGetOrderBookResponded)
        {
            binanceGetOrderBookResponded = false;
            
            const parms = {
                symbol: "BNBUSDT"
            }
            binanceInterface.getOrderBook(parms, binanceGetOrderBookCB)
        }

        //Bitmax
        if(bitmaxGetTickerResponded)
        {
            bitmaxGetTickerResponded = false;

            const parms = {
                symbol: "BNB/USDT"
            }
            bitmaxInterface.getTicker(parms, bitmaxGetTickerCB)
        }

        //calculate time
        let currentTime = Date.now();
        document.getElementById("Binance_LastUpdate").innerHTML = Math.abs(currentTime - Binance_LastUpdate) + " ms";
        document.getElementById("BitMax_LastUpdate").innerHTML = Math.abs(currentTime - BitMax_LastUpdate) + " ms";

        await delay(100);
    }
}

//callbacks
function binanceGetPriceCB(resBody)
{
    binanceGetPriceResponded = true;
    if(!resBody) return;
    Binance_LastUpdate = Date.now();

    Binance_BNB_USDT_close = parseFloat(resBody.price);
    
    document.getElementById("Binance_BNB_USDT_close").innerHTML = Binance_BNB_USDT_close.toFixed(4);

    recalCloseDiff();
}
function binanceGetOrderBookCB(resBody)
{
    binanceGetOrderBookResponded = true;
    if(!resBody) return;
    Binance_LastUpdate = Date.now();

    Binance_BNB_USDT_bid = parseFloat(resBody.bidPrice);
    Binance_BNB_USDT_ask = parseFloat(resBody.askPrice);
    Binance_BNB_USDT_bidVol = parseFloat(resBody.bidQty);
    Binance_BNB_USDT_askVol = parseFloat(resBody.askQty);

    document.getElementById("Binance_BNB_USDT_bid").innerHTML = Binance_BNB_USDT_bid.toFixed(4)+' / '+Binance_BNB_USDT_bidVol.toFixed(2);
    document.getElementById("Binance_BNB_USDT_ask").innerHTML = Binance_BNB_USDT_ask.toFixed(4)+' / '+Binance_BNB_USDT_askVol.toFixed(2);

    recalMaxProfit();
}

function bitmaxGetTickerCB(resBody)
{
    bitmaxGetTickerResponded = true;
    if(!resBody) return;
    BitMax_LastUpdate = Date.now();

    BitMax_BNB_USDT_close = parseFloat(resBody.data.close);
    BitMax_BNB_USDT_bid = parseFloat(resBody.data.bid[0]);
    BitMax_BNB_USDT_ask = parseFloat(resBody.data.ask[0]);
    BitMax_BNB_USDT_bidVol = parseFloat(resBody.data.bid[1]);
    BitMax_BNB_USDT_askVol = parseFloat(resBody.data.ask[1]);

    document.getElementById("BitMax_BNB_USDT_close").innerHTML = BitMax_BNB_USDT_close.toFixed(4);
    document.getElementById("BitMax_BNB_USDT_bid").innerHTML = BitMax_BNB_USDT_bid.toFixed(4)+' / '+BitMax_BNB_USDT_bidVol.toFixed(2);
    document.getElementById("BitMax_BNB_USDT_ask").innerHTML = BitMax_BNB_USDT_ask.toFixed(4)+' / '+BitMax_BNB_USDT_askVol.toFixed(2);

    recalCloseDiff();
    recalMaxProfit();
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
function recalMaxProfit()
{
    if(Binance_BNB_USDT_bid && Binance_BNB_USDT_ask && BitMax_BNB_USDT_bid && BitMax_BNB_USDT_ask)
    {
        BinanceBuy_BitMaxSell = BitMax_BNB_USDT_bid - Binance_BNB_USDT_ask;
        BinanceBuy_BitMaxSell_withFee = BitMax_BNB_USDT_bid * (1.0-BitMax_fee) - Binance_BNB_USDT_ask * (1.0+Binance_fee);
        BinanceBuy_BitMaxSell_MaxVol = Math.min(BitMax_BNB_USDT_bidVol, Binance_BNB_USDT_askVol);

        BinanceSell_BitMaxBuy = Binance_BNB_USDT_bid - BitMax_BNB_USDT_ask;
        BinanceSell_BitMaxBuy_withFee = Binance_BNB_USDT_bid * (1.0-Binance_fee) - BitMax_BNB_USDT_ask * (1.0+BitMax_fee);
        BinanceSell_BitMaxBuy_MaxVol = Math.min(Binance_BNB_USDT_bidVol, BitMax_BNB_USDT_askVol);

        maxProfit = Math.max(BinanceBuy_BitMaxSell, BinanceSell_BitMaxBuy);
        maxProfit_withFee = Math.max(BinanceBuy_BitMaxSell_withFee, BinanceSell_BitMaxBuy_withFee);

        document.getElementById("diff_BNB_USDT_maxProfit").innerHTML = (maxProfit_withFee>=0? '+': '') + maxProfit_withFee.toFixed(4)
            +"<br/> ("+ (maxProfit>=0? '+': '') + maxProfit.toFixed(4) +")";
    }
}



/* -------------- Profitable Price Records -------------- */

