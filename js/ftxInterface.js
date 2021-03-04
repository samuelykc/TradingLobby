const https = require('follow-redirects').https;
const querystring = require('querystring');
const CryptoJS = require("crypto-js");


const hostname = 'ftx.com';


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
        let signature = CryptoJS.HmacSHA256(timestamp+'GET'+'/api/wallet/balances', APISecretKey).toString();

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

    // postOrderTest(parms, callback)
    // {
    //     parms.timestamp = Date.now();
    //     parms.signature = CryptoJS.HmacSHA256(querystring.stringify(parms), APISecretKey).toString();

    //     var options = {
    //         'method': 'POST',
    //         'hostname': hostname,
    //         'path': '/api/v3/order/test?' + querystring.stringify(parms),
    //         'headers': {
    //             'Content-Type': 'application/json',
    //             'X-MBX-APIKEY': APIPublicKey
    //         },
    //         'maxRedirects': 20
    //     };

    //     httpsRequest(options, callback);
    // },

    // postOrder(parms, callback)
    // {
    //     parms.timestamp = Date.now();
    //     parms.signature = CryptoJS.HmacSHA256(querystring.stringify(parms), APISecretKey).toString();

    //     var options = {
    //         'method': 'POST',
    //         'hostname': hostname,
    //         'path': '/api/v3/order?' + querystring.stringify(parms),
    //         'headers': {
    //             'Content-Type': 'application/json',
    //             'X-MBX-APIKEY': APIPublicKey
    //         },
    //         'maxRedirects': 20
    //     };

    //     httpsRequest(options, callback);
    // },

    // getOrder(parms, callback)
    // {
    //     parms.timestamp = Date.now();
    //     parms.signature = CryptoJS.HmacSHA256(querystring.stringify(parms), APISecretKey).toString();

    //     var options = {
    //         'method': 'GET',
    //         'hostname': hostname,
    //         'path': '/api/v3/order?' + querystring.stringify(parms),
    //         'headers': {
    //             'Content-Type': 'application/json',
    //             'X-MBX-APIKEY': APIPublicKey
    //         },
    //         'maxRedirects': 20
    //     };

    //     httpsRequest(options, callback);
    // },
};