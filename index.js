const { ipcRenderer } = require('electron')

const https = require('follow-redirects').https;
const querystring = require('querystring');

const binanceInterface = require('./js/binanceInterface');
const bitmaxInterface = require('./js/bitmaxInterface');





let Binance_BNB_USDT_close, Binance_BNB_USDT_bid, Binance_BNB_USDT_ask, Binance_BNB_USDT_bidVol, Binance_BNB_USDT_askVol;
let BitMax_BNB_USDT_close, BitMax_BNB_USDT_bid, BitMax_BNB_USDT_ask, BitMax_BNB_USDT_bidVol, BitMax_BNB_USDT_askVol;

window.onload = function () {
    asyncCall();
};




function binanceGetTickerCB(resBody)
{
    Binance_BNB_USDT_close = parseFloat(resBody.price);
    // Binance_BNB_USDT_bid = parseFloat(resBody.data.bid[0]);
    // Binance_BNB_USDT_ask = parseFloat(resBody.data.ask[0]);
    // Binance_BNB_USDT_bidVol = parseFloat(resBody.data.bid[1]);
    // Binance_BNB_USDT_askVol = parseFloat(resBody.data.ask[1]);
    binanceGetTickerResponded = true;

    document.getElementById("Binance_BNB_USDT_close").innerHTML = Binance_BNB_USDT_close.toFixed(4);
    // document.getElementById("Binance_BNB_USDT_bid").innerHTML = Binance_BNB_USDT_bid.toFixed(4)+' / '+Binance_BNB_USDT_bidVol.toFixed(2);
    // document.getElementById("Binance_BNB_USDT_ask").innerHTML = Binance_BNB_USDT_ask.toFixed(4)+' / '+Binance_BNB_USDT_askVol.toFixed(2);

    if(Binance_BNB_USDT_close && BitMax_BNB_USDT_close)
    {
        let diff = Binance_BNB_USDT_close - BitMax_BNB_USDT_close;
        document.getElementById("diff_BNB_USDT_close").innerHTML = (diff>=0? '+': '') + diff.toFixed(4);
    }
}

function bitmaxGetTickerCB(resBody)
{
    BitMax_BNB_USDT_close = parseFloat(resBody.data.close);
    BitMax_BNB_USDT_bid = parseFloat(resBody.data.bid[0]);
    BitMax_BNB_USDT_ask = parseFloat(resBody.data.ask[0]);
    BitMax_BNB_USDT_bidVol = parseFloat(resBody.data.bid[1]);
    BitMax_BNB_USDT_askVol = parseFloat(resBody.data.ask[1]);
    bitmaxGetTickerResponded = true;

    document.getElementById("BitMax_BNB_USDT_close").innerHTML = BitMax_BNB_USDT_close.toFixed(4);
    document.getElementById("BitMax_BNB_USDT_bid").innerHTML = BitMax_BNB_USDT_bid.toFixed(4)+' / '+BitMax_BNB_USDT_bidVol.toFixed(2);
    document.getElementById("BitMax_BNB_USDT_ask").innerHTML = BitMax_BNB_USDT_ask.toFixed(4)+' / '+BitMax_BNB_USDT_askVol.toFixed(2);

    if(Binance_BNB_USDT_close && BitMax_BNB_USDT_close)
    {
        let diff = Binance_BNB_USDT_close - BitMax_BNB_USDT_close;
        document.getElementById("diff_BNB_USDT_close").innerHTML = (diff>=0? '+': '') + diff.toFixed(4);
    }
}








function delay(t, val) {
   return new Promise(function(resolve) {
       setTimeout(function() {
           resolve(val);
       }, t);
   });
}


let binanceGetTickerResponded = true;
let bitmaxGetTickerResponded = true;

async function asyncCall() {
    while(true)
    {
        if(binanceGetTickerResponded)
        {
            binanceGetTickerResponded = false;
            
            const parms = {
                symbol: "BNBUSDT"
            }
            binanceInterface.getTicker(parms, binanceGetTickerCB)
        }

        if(bitmaxGetTickerResponded)
        {
            bitmaxGetTickerResponded = false;

            const parms = {
                symbol: "BNB/USDT"
            }
            bitmaxInterface.getTicker(parms, bitmaxGetTickerCB)
        }
            
        await delay(100);
    }
}