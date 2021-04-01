const binanceInterface = require('./js/binanceInterface');
const bitmaxInterface = require('./js/bitmaxInterface');
const ftxInterface = require('./js/ftxInterface');
const fileIOInterface = require('./js/fileIOInterface');
const mathExtend = require('./js/mathExtend');
const dateFormat = require('dateformat');



const dataDir = "data/";
fileIOInterface.makeDirSync(dataDir);

const configFile = "config.txt";






let marketSubscriptions = [];


async function fetchMarketData()
{


    while(true)
    {
        //check for subscriptions without active ticker stream
        marketSubscriptions.forEach(
            function(subscription)
            {
                if(!subscription.tickerStream)
                {
                    console.log('assigning tickerStream to ('+subscription.exchange+') '+subscription.pairName);
                    
                    if(subscription.exchange == "Binance")
                    {
                        binanceInterface.subscribeMiniTickerStream(subscription.pairName, 
                                                                    subscription.callback, 
                                                                    () => { subscription.tickerStream = false; });
                    }
                    else if(subscription.exchange == "FTX")
                    {
                        ftxInterface.subscribeFakeMiniTickerStream(subscription.pairName, 
                                                                    subscription.callback, 
                                                                    () => { subscription.tickerStream = false; });
                    }

                    subscription.tickerStream = true;

                    //TODO: tickerStream should be shared by subscriptions with same concern
                }
            }
        );


        await delay(1000);
    }
};

fetchMarketData();








function delay(t, val)
{
    return new Promise(
        function(resolve)
        {
            setTimeout( function(){resolve(val);}, t);
        }
    );
}


module.exports = {
    subscribeMarketData(subscription)
    {
        marketSubscriptions.push(subscription);

        // console.log(subscription);
    },
}