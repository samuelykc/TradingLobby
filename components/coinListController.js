/*

<ul class="collection coinList">
</ul>

*/

const CoinListItemController = require('./coinListItemController');

module.exports = class CoinListController
{
  constructor(coinListRoot, exchange)
  {
    //coinList
    this.coinList = document.createElement('ul');
    this.coinList.className = "collection coinList";

    coinListRoot.appendChild(this.coinList);



    //coinListItem
    let pairName = 'BTC/USDT';
    let pairName_API = 'btcusdt';
    let alarms = '';
    let item = new CoinListItemController(this.coinList, exchange, pairName, pairName_API, alarms);

    pairName = 'ETH/USDT';
    pairName_API = 'ethusdt';
    alarms = '';
    let item2 = new CoinListItemController(this.coinList, exchange, pairName, pairName_API, alarms);

    pairName = 'BNB/USDT';
    pairName_API = 'bnbusdt';
    alarms = '';
    let item3 = new CoinListItemController(this.coinList, exchange, pairName, pairName_API, alarms);
  }


  remove()
  {

  }


  /* ------------------ actions ------------------ */
  onAddCoinListItem()
  {
    
  }

  onRemoveCoinListItem()
  {
    
  }

  onToggleListAlarms()
  {
    
  }
}
