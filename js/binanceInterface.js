module.exports = {

    getTicker(parms, callback)
    {
        let options = {
            'method': 'GET',
            'hostname': 'www.binance.com',
            'path': '/api/v3/ticker/price' + '?' + querystring.stringify(parms),
            'maxRedirects': 20
        };

        let req = https.request(options, function (res)
        {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                let body = Buffer.concat(chunks);

                // console.log(body.toString());
                callback(JSON.parse(body.toString()))
            });

            res.on("error", function (error) {
                console.error(error);
            });
        });

        req.end();
    }
};