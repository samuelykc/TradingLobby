const https = require('follow-redirects').https;
const querystring = require('querystring');
const CryptoJS = require("crypto-js");


const hostname = 'api.binance.com';


const APIPublicKey = '7u6GIGcNyMTrgWlLX3xyCXWp7iXJl6HUShINSZELiWRh0SSPP4srXDXWYrGPseId';
const APISecretKey = 'KxhMXoRfxPgPNyvBaEdbsn1I4v75paTJIQ1Pi7NJobtZ0HUyZzw9SHdmbPq0AVYK';




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
                console.error(e);
                callback('');
            }
        });

        res.on("error", function (error) {
            console.error(error);
        });
    });

    req.end();
}




module.exports = {

    /* -------------- Public -------------- */

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


    /* -------------- Private -------------- */

    getWalletAllCoin(callback)
    {
        let parms = {
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
    }
};