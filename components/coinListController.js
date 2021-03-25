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
    let alarms = '';
    let item = new CoinListItemController(this.coinList, exchange, pairName, alarms);

    pairName = 'ETH/USDT';
    alarms = '';
    let item2 = new CoinListItemController(this.coinList, exchange, pairName, alarms);

    pairName = 'BNB/USDT';
    alarms = '';
    let item3 = new CoinListItemController(this.coinList, exchange, pairName, alarms);
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
