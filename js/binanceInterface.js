const https = require('follow-redirects').https;
const querystring = require('querystring');
const CryptoJS = require("crypto-js");


const hostname = 'api.binance.com';


let APIPublicKey, APISecretKey;




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




module.exports = {

    /* -------------- Setter -------------- */

    setAPIKeys(publicKey, secretKey)
    {
        APIPublicKey = publicKey;
        APISecretKey = secretKey;
    },

    /* -------------- Public API -------------- */

    getPrice(parms, callback)
    {
        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/v3/ticker/price?' + querystring.stringify(parms),
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

    getOrderBook(parms, callback)
    {
        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/v3/ticker/bookTicker?' + querystring.stringify(parms),
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

    subscribeAllMarketMiniTickerStream(market_name, onmessage, onclose)
    {
        let socket = new WebSocket("wss://stream.binance.com:9443/ws/!miniTicker@arr");

        socket.onopen = function(e)
        {
            console.log("[open] Connection established");
        };

        socket.onmessage = function(event)
        {
            // console.log(`[message] Data received from server: ${event.data}`);
            
            try
            {
                let jsonData = JSON.parse(event.data);
                onmessage(jsonData);
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
            onclose();
        };

        socket.onerror = function(error)
        {
            console.log(`[error] ${error.message}`);
        };

        return socket;
    },

    subscribeMiniTickerStream(market_name, onmessage, onclose)
    {
        let socket = new WebSocket("wss://stream.binance.com:9443/ws/"+market_name+"@miniTicker");

        socket.onopen = function(e)
        {
            console.log("[open] Connection established");
        };

        socket.onmessage = function(event)
        {
            // console.log(`[message] Data received from server: ${event.data}`);
            
            try
            {
                let jsonData = JSON.parse(event.data);
                onmessage(jsonData);
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
            onclose();
        };

        socket.onerror = function(error)
        {
            console.log(`[error] ${error.message}`);
        };

        return socket;
    },

    subscribeTickerStream(market_name, onmessage, onclose)
    {
        let socket = new WebSocket("wss://stream.binance.com:9443/ws/"+market_name+"@bookTicker");

        socket.onopen = function(e)
        {
            console.log("[open] Connection established");
        };

        socket.onmessage = function(event)
        {
            // console.log(`[message] Data received from server: ${event.data}`);
            
            try
            {
                let jsonData = JSON.parse(event.data);
                onmessage(jsonData);
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
            onclose();
        };

        socket.onerror = function(error)
        {
            console.log(`[error] ${error.message}`);
        };

        return socket;
    },


    /* -------------- Private API -------------- */

    getWalletAllCoin(callback)
    {
        let parms = {
            recvWindow: 60000,  //resolve {code: -1021, msg: "Timestamp for this request is outside of the recvWindow."}
            timestamp: Date.now(),
            // signature: 
        }
        let signature = CryptoJS.HmacSHA256(querystring.stringify(parms), APISecretKey).toString();

        parms.signature = signature;


        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/sapi/v1/capital/config/getall?' + querystring.stringify(parms),
            'headers': {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': APIPublicKey
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

    postOrderTest(parms, callback)
    {
        parms.timestamp = Date.now();
        parms.signature = CryptoJS.HmacSHA256(querystring.stringify(parms), APISecretKey).toString();

        let options = {
            'method': 'POST',
            'hostname': hostname,
            'path': '/api/v3/order/test?' + querystring.stringify(parms),
            'headers': {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': APIPublicKey
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

    postOrder(parms, callback)
    {
        parms.recvWindow = 60000;   //resolve {code: -1021, msg: "Timestamp for this request is outside of the recvWindow."}
        parms.timestamp = Date.now();
        parms.signature = CryptoJS.HmacSHA256(querystring.stringify(parms), APISecretKey).toString();

        let options = {
            'method': 'POST',
            'hostname': hostname,
            'path': '/api/v3/order?' + querystring.stringify(parms),
            'headers': {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': APIPublicKey
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

    getOrder(parms, callback)
    {
        parms.recvWindow = 60000;   //resolve {code: -1021, msg: "Timestamp for this request is outside of the recvWindow."}
        parms.timestamp = Date.now();
        parms.signature = CryptoJS.HmacSHA256(querystring.stringify(parms), APISecretKey).toString();

        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/v3/order?' + querystring.stringify(parms),
            'headers': {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': APIPublicKey
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },
};