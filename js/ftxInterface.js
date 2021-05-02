/*
FTX close price vs last price:
Although close price seems to be calculated from opening buy/sell orders, unlike last price which reflects the 
price of the last filled trade, the whole high-low-open-close on FTX follows this same logic so that using 
last price with high & low would causes trouble.
In some occasions when the price for a certain pair hits the high/low, the value of last price may not match 
the high/low price. In previous implementation, this has caused the value of high flipping between high & last.

Meanwhile, the latest candle in historical price candles from FTX is not up-to-date, so that it cannot be relied on 
for price monitoring.

FTX candles:
It seems that FTX has a weird behaviour when returning candles for a certain pair. The situation where: 
At T0, it may return candles A, B, C, D...
From T1 to T2, it may return candles B, C, D, E...
At T3, somehow it returns candles A, B, C, D... again.
This could cause the high/low values flipping back and forth in time repeatedly.
Ammendment: Perhaps the start_time parameter for getting the candles is completely useless and doing nothing in the API 
despite how the API documentation suggested its design is.

*/

const https = require('follow-redirects').https;
const querystring = require('querystring');
const CryptoJS = require("crypto-js");
const ccxt = require ('ccxt');


const hostname = 'ftx.com';


let APIPublicKey, APISecretKey;
let exchange;




function httpsRequest(options, callback)
{
    let req = https.request(options, function (res)
    {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
            let body = Buffer.concat(chunks);

            // console.log(body.toString());
            try
            {
                callback(JSON.parse(body.toString()));
            }
            catch(e)
            {
                console.error(e.message);
                callback('');
            }
        });

        res.on("error", function (error) {
            console.error(error);
            callback('');
        });
    });

    req.end();
}

let stopKeepStreamAlive = false;
async function keepStreamAlive(socket)
{
    const ping = JSON.stringify({'op': 'ping'});

    while(socket && !stopKeepStreamAlive)
    {
        socket.send(ping);
        await delay(15000);
    }

    stopKeepStreamAlive = false;
}

function delay(t, val) {
   return new Promise(function(resolve) {
       setTimeout(function() {
           resolve(val);
       }, t);
   });
}


let activeFetchCandlesAsStream = {};    //only support 1 stream instance for each market at the same time
async function fetchCandlesAsStream(market_name)  //fetch candles continuosly and callback like a stream would
{
    /* -------------- initial candles cache -------------- */
    let candleList = [];
    let candleListChanged = true;
    let candleListFirstFetchComplete = false, candleListSecondFetchComplete = false;

    //get the 60sec candles for the past 24hr&1min, which should consist of 1441 candles
    while(!candleListFirstFetchComplete)
    {
        getCandles(market_name, {resolution: 60, limit: 1441},
            (respond)=>
            {
                if(!candleListFirstFetchComplete && respond.result)
                {
                    candleList = respond.result;
                    candleListFirstFetchComplete = true;
                }
            }
        );
        await delay(400);
    }


    /* -------------- continuos data retrieve -------------- */
    let data = {};

    data.s = market_name.replace('/', '');
    data.c = data.o = data.h = data.l = -1;

    let getCandlesRespondHandled = true;
    let getCandlesLastUpdate = 0;

    let getPriceRespondHandled = true;
    let getPriceLastUpdate = 0;

    
    while(activeFetchCandlesAsStream[market_name].run)
    {
        //retrieve new data if last respond was handled already
        if(getCandlesRespondHandled)
        {
            getCandlesRespondHandled = false;

            getCandles(market_name, {resolution: 60, limit: 1},
                (respond)=>
                {
                    getCandlesLastUpdate = Date.now();

                    if(respond.result && respond.result[0]) //sometimes FTX can respond with a success result with empty result array
                    {
                        let shiftedCandle;

                        if(!candleList.find(c => c.time == respond.result[0].time))  //include the candle only if it doesn't exist
                        {
                            shiftedCandle = candleList[0];
                            candleList.push(respond.result[0]);
                            candleList.shift();
                            candleListChanged = true;
                        }

                        if(candleListChanged)
                        {
                            // let close = candleList[candleList.length - 1].close;
                            let open = candleList[0].open;
                            let high = candleList[0].high;
                            let low = candleList[0].low;

                            if(!shiftedCandle || (shiftedCandle.high >= data.h || shiftedCandle.low <= data.l))
                            {
                                //running the code for the first time, or
                                //candle responsible for the high and/or low may have been shifted away, rescan
                                candleList.forEach((item)=>{
                                    if(item.high>high) high = item.high;
                                    if(item.low<low) low = item.low;
                                });
                            }
                            else
                            {
                                //candle being shifted away has nothing to do with high & low
                                high = data.h;
                                low = data.l;
                            }

                            //update data & callback onmessage() if data changed
                            if(/*close!=data.c ||*/ open!=data.o || high!=data.h || low!=data.l)
                            {
                                /*data.c=close;*/ data.o=open; data.h=high; data.l=low;
                                if(data.c >= 0) activeFetchCandlesAsStream[market_name].onmessage(data);    //call only when all data ready
                            }

                            candleListChanged = false;
                        }
                    }

                    getCandlesRespondHandled = true;
                }
            );
        }
        if(getPriceRespondHandled)
        {
            getPriceRespondHandled = false;

            getPrice(market_name, 
                (respond)=>
                {
                    getPriceLastUpdate = Date.now();

                    if(respond.result)
                    {
                        let close = respond.result.last;
                        let high = (respond.result.last>data.h? respond.result.last: data.h);
                        let low = (respond.result.last<data.l? respond.result.last: data.l);

                        //update data & callback onmessage() if data changed
                        if(close!=data.c || high!=data.h || low!=data.l)
                        {
                            data.c=close; data.h=high; data.l=low;
                            if(data.o >= 0) activeFetchCandlesAsStream[market_name].onmessage(data);    //call only when all data ready
                        }

                        //update current candle
                        if(close>candleList[candleList.length - 1].high) candleList[candleList.length - 1].high = close;
                        if(close<candleList[candleList.length - 1].low) candleList[candleList.length - 1].low = close;
                    }

                    getPriceRespondHandled = true;
                }
            );
        }

        //resume from failed respond waiting
        if(!getCandlesRespondHandled && (Date.now()-getCandlesLastUpdate) > 2000) getCandlesRespondHandled = true;
        if(!getPriceRespondHandled && (Date.now()-getPriceLastUpdate) > 2000) getPriceRespondHandled = true;

        await delay(200);
    }

    activeFetchCandlesAsStream[market_name].onclose(data);
}




function getPrice(market_name, callback)
{
    let options = {
        'method': 'GET',
        'hostname': hostname,
        'path': '/api/markets/'+market_name,
        'maxRedirects': 20
    };

    httpsRequest(options, callback);
}

function getCandles(market_name, parms, callback)    //params: resolution, (limit), (start_time), (end_time)
{
    let options = {
        'method': 'GET',
        'hostname': hostname,
        'path': '/api/markets/'+market_name+'/candles?' + querystring.stringify(parms),
        'maxRedirects': 20
    };

    httpsRequest(options, callback);
}


module.exports = {

    /* -------------- Setter -------------- */

    setAPIKeys(publicKey, secretKey)
    {
        APIPublicKey = publicKey;
        APISecretKey = secretKey;

        exchange = new ccxt.ftx ({
            'apiKey': publicKey,
            'secret': secretKey,
            'enableRateLimit': true
        });
        // console.log(exchange);
    },

    /* -------------- Public API -------------- */

    getPrice,

    getOrderBook(market_name, parms, callback)
    {
        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/markets/'+market_name+'/orderbook?' + querystring.stringify(parms),
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

    getCandles,

    /* fake stream is not perfect:
     1) its 24h statistics is actually 24h plus the latest 60s-window
     2) close price updates could be missed in between retrieve since we are asking for data instead of having the server pushing data */
    subscribeFakeMiniTickerStream(market_name, onmessage, onclose)  //fake ticker stream with 24h high/low/open
    {
        if(!activeFetchCandlesAsStream[market_name])
            activeFetchCandlesAsStream[market_name] = {};

        activeFetchCandlesAsStream[market_name].onmessage = onmessage;
        activeFetchCandlesAsStream[market_name].onclose = onclose;
        
        if(!activeFetchCandlesAsStream[market_name].run)    //if not running, or not even initialized
        {
            activeFetchCandlesAsStream[market_name].run = true;
            fetchCandlesAsStream(market_name);
        }

        return { 'close': ()=>
            {
                if(activeFetchCandlesAsStream[market_name])
                    activeFetchCandlesAsStream[market_name].run = false;

                onclose();
            }
        };  //return fake WebSocket object with close() function
    },

    unsubscribeFakeMiniTickerStream(market_name)
    {
        if(activeFetchCandlesAsStream[market_name])
            activeFetchCandlesAsStream[market_name].run = false;
    },

    subscribeTickerStream(market_name, onmessage, onclose)
    {
        let socket = new WebSocket("wss://ftx.com/ws/");

        socket.onopen = function(e)
        {
            console.log("[open] Connection established");

            keepStreamAlive(socket);

            let msg = {'op': 'subscribe', 'channel': 'ticker', 'market': market_name};
            socket.send(JSON.stringify(msg));
        };

        socket.onmessage = function(event)
        {
            // console.log(`[message] Data received from server: ${event.data}`);
            
            try
            {
                let jsonData = JSON.parse(event.data);
                if(jsonData.type=="update") onmessage(jsonData);
            }
            catch(e)
            {
                console.error(e.message);
            }
        };

        socket.onclose = function(event)
        {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            }
            else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                console.log('[close] Connection died');
            }
            stopKeepStreamAlive = true;
            onclose();
        };

        socket.onerror = function(error)
        {
            console.log(`[error] ${error.message}`);
            stopKeepStreamAlive = true;
        };

        return socket;
    },


    /* -------------- Private API -------------- */

    getWalletAllCoin(callback)
    {
        let timestamp = Date.now();
        let payload = timestamp+'GET'+'/api/wallet/balances';
        let signature = CryptoJS.HmacSHA256(payload, APISecretKey).toString();

        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/wallet/balances',
            'headers': {
                'Content-Type': 'application/json',
                'FTX-KEY': APIPublicKey,
                'FTX-TS': timestamp,
                'FTX-SIGN': signature
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

    postOrder(parms, callback)
    {
        /*
        let timestamp = Date.now();
        let payload = timestamp+'POST'+'/api/orders'+JSON.stringify(parms).replaceAll(',', ', ').replaceAll(':', ': ');
        let signature = CryptoJS.HmacSHA256(payload, APISecretKey).toString();

        // console.log(payload)
        // console.log(signature)

        let options = {
            'method': 'POST',
            'hostname': hostname,
            'path': '/api/orders?' + querystring.stringify(parms),
            'headers': {
                'Content-Type': 'application/json',
                'FTX-KEY': APIPublicKey,
                'FTX-TS': timestamp,
                'FTX-SIGN': signature
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
        */

        let parameters = {};
        if(parms.reduceOnly) parameters.reduceOnly = parms.reduceOnly;
        if(parms.ioc) parameters.ioc = parms.ioc;
        if(parms.postOnly) parameters.postOnly = parms.postOnly;
        if(parms.clientId) parameters.clientId = parms.clientId;

        let create_order_promise = exchange.create_order(parms.market, parms.type, parms.side, parms.size, parms.price, parameters);

        console.log(create_order_promise);

        create_order_promise.then(
            function(val)
            {
                callback(val);
            }
        )
        .catch(
            (reason) =>
            {
                callback(reason);
            }
        );
    },

    getOrder(client_order_id, callback)
    {
        let timestamp = Date.now();
        let payload = timestamp+'GET'+'/api/orders/by_client_id/'+client_order_id;
        let signature = CryptoJS.HmacSHA256(payload, APISecretKey).toString();

        console.log(payload);

        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/orders/by_client_id/' + client_order_id,
            'headers': {
                'Content-Type': 'application/json',
                'FTX-KEY': APIPublicKey,
                'FTX-TS': timestamp,
                'FTX-SIGN': signature
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },
};