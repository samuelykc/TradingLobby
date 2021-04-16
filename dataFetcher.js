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
    if(subscription.exchange &&
       subscription.pairName &&
       subscription.callback)
      marketSubscriptions.push(subscription);

    // console.log(subscription);
  },
  unsubscribeMarketData(subscription)
  {
    //remove subscription from array first, so it will not be reassigned with web socket after close
    let index = marketSubscriptions.indexOf(subscription);
    if(index !== -1)
    {
      marketSubscriptions.splice(index, 1);
      console.log("remove list item for ("+subscription.exchange+") "+subscription.pairName);
    }

    //close web socket, in case of FakeMiniTickerStream there will be no close() function
    if(subscription.tickerStream && subscription.tickerStream.close) subscription.tickerStream.close();
    if(subscription.tickerStream && subscription.tickerStream.close) console.log("remove tickerStream for ("+subscription.exchange+") "+subscription.pairName);
  },
}