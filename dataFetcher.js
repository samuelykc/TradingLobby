/*
Binance allMarketTickerStream vs individual streams:
Although allMarketTickerStream only needs 1 active stream to communicate, it consumes more computation power
and bandwidth than having seperate streams for the required pairs. Without showing any improvement to the Binance
freezd data communication problem, the allMarketTickerStream is no longer considered for implementation.
*/

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
// let binanceMarketSubscriptions = [];  //extra array to hold items in marketSubscriptions that belong to Binance (Implementation for allMarketTickerStream)


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
            // Implementation with allMarketTickerStream
            // if(!binanceAllMarketTickerStream)
            //   binanceAllMarketTickerStream = binanceInterface.subscribeAllMarketMiniTickerStream(binanceAllMarketTickerStreamCBsCaller, 
            //                                                                         () => { binanceAllMarketTickerStream = {}; });
            // subscription.tickerStream = true;

            // Implementation with individual streams
            subscription.tickerStream = binanceInterface.subscribeMiniTickerStream(subscription.pairName, 
                                                                              subscription.callback, 
                                                                              () => { subscription.tickerStream = {}; });
          }
          else if(subscription.exchange == "FTX")
          {
            subscription.tickerStream = ftxInterface.subscribeFakeMiniTickerStream(subscription.pairName, 
                                                                              subscription.callback, 
                                                                              () => { subscription.tickerStream = {}; });
          }

          //TODO: tickerStream should be shared by subscriptions with same concern
        }
      }
    );

    await delay(1000);
  }
};

fetchMarketData();




// let binanceAllMarketTickerStream;    //(Implementation for allMarketTickerStream)
// function binanceAllMarketTickerStreamCBsCaller(allMarketData)
// {
//   binanceMarketSubscriptions.forEach(
//     (subscription)=>
//     {
//       for(let data of allMarketData)
//       {
//         if(data.s == subscription.pairName.toUpperCase())
//         {
//           subscription.callback(data);
//           break;
//         }
//       }
//     }
//   );
// }




function delay(t, val)
{
  return new Promise(
    function(resolve)
    {
      setTimeout( function(){resolve(val);}, t);
    }
  );
}






/* -------------- interface -------------- */
module.exports =
{
  subscribeMarketData(subscription)
  {
    if(subscription.exchange &&
       subscription.pairName &&
       subscription.callback)
    {
      marketSubscriptions.push(subscription);

      // if(subscription.exchange == "Binance") binanceMarketSubscriptions.push(subscription);  // (Implementation for allMarketTickerStream)
    }

    // console.log(subscription);
  },
  unsubscribeMarketData(subscription)
  {
    //remove subscription from array first, so it will not be reassigned with web socket after close
    //remove subscription (marketSubscriptions)
    let index = marketSubscriptions.indexOf(subscription);
    if(index !== -1)
    {
      marketSubscriptions.splice(index, 1);
      console.log("remove ("+subscription.exchange+") "+subscription.pairName+" from marketSubscriptions[]");
    }
    //remove subscription (binanceMarketSubscriptions) (Implementation for allMarketTickerStream)
    // index = binanceMarketSubscriptions.indexOf(subscription);
    // if(index !== -1)
    // {
    //   binanceMarketSubscriptions.splice(index, 1);
    //   console.log("remove ("+subscription.exchange+") "+subscription.pairName+" from binanceMarketSubscriptions[]");
    // }


    //close web socket
    if(subscription.tickerStream && subscription.tickerStream.close)
    {
      subscription.tickerStream.close();
      console.log("close web socket for ("+subscription.exchange+") "+subscription.pairName);
    }

    //close web socket (binanceAllMarketTickerStream) (Implementation for allMarketTickerStream)
    // if(binanceAllMarketTickerStream && !binanceMarketSubscriptions.length)
    // {
    //   binanceAllMarketTickerStream.close();
    //   console.log("close web socket for binanceAllMarketTickerStream");
    // }
  },
}