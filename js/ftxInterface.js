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

    getPrice(market_name, callback)
    {
        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/markets/'+market_name,
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },

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

        console.log(payload)
        // console.log(signature)

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

        // let create_order_promise = exchange.fetch_order(parms.id, parms.type, parms.side, parms.size, parms.price, parameters);

        // console.log(create_order_promise);

        // create_order_promise.then(
        //     function(val)
        //     {
        //         callback(val);
        //     }
        // )
        // .catch(
        //     (reason) =>
        //     {
        //         callback(reason);
        //     }
        // );
    },
};