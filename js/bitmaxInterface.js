const https = require('follow-redirects').https;
const querystring = require('querystring');
const CryptoJS = require("crypto-js");


const hostname = 'bitmax.io';


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

    /* -------------- Public -------------- */

    getTicker(parms, callback)
    {
        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/api/pro/v1/ticker?' + querystring.stringify(parms),
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    },


    /* -------------- Private -------------- */

    getWalletAllCoin(callback)
    {
        let timestamp = Date.now();
        let signature = CryptoJS.HmacSHA256(timestamp + 'balance', APISecretKey).toString();

        let options = {
            'method': 'GET',
            'hostname': hostname,
            'path': '/4/api/pro/v1/cash/balance',
            'headers': {
                'x-auth-key': APIPublicKey,
                'x-auth-timestamp': timestamp,
                'x-auth-signature': signature
            },
            'maxRedirects': 20
        };

        httpsRequest(options, callback);
    }
};