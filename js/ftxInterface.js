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
    let data = {};
    data.c = data.o = data.h = data.l = -1;

    let getCandlesRespondHandled = true;
    let getCandlesLastUpdate = 0;

    let getPriceRespondHandled = true;
    let getPriceLastUpdate = 0;
    
    while(activeFetchCandlesAsStream[market_name].run)
    {
        //retrieve new data if last respond was handled already
        if(getCandlesRespondHandled)    //not using the close price of the last candle since the number seems wrong
        {
            getCandlesRespondHandled = false;

            getCandles(market_name, {resolution: 60, limit: 1441},
                (respond)=>
                {
                    getCandlesLastUpdate = Date.now();

                    if(respond.result)
                    {
                        // let close = respond.result[respond.result.length - 1].close;
                        let open = respond.result[0].open;
                        let high = respond.result[0].high;
                        let low = respond.result[0].low;

                        respond.result.forEach((item)=>{
                            if(item.high>high) high = item.high;
                            if(item.low<low) low = item.low;
                        });

                        if(/*close!=data.c || */open!=data.o || high!=data.h || low!=data.l)    //callback onmessage() if data changed
                        {
                            /*data.c=close; */data.o=open; data.h=high; data.l=low;
                            activeFetchCandlesAsStream[market_name].onmessage(data);
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

                        if(close!=data.c || high!=data.h || low!=data.l)    //callback onmessage() if data changed
                        {
                            data.c=close; data.h=high; data.l=low;
                            activeFetchCandlesAsStream[market_name].onmessage(data);
                        }
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