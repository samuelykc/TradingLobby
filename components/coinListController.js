/*

<ul class="collection coinList">
  <div class="coinListHeader">Binance</div>
  
  <div class="coinListContent">
    <li class="collection-item avatar coinListItem">...</li>
    <li class="collection-item avatar coinListItem">...</li>
  </div>
</ul>

*/

const CoinListItemController = require('./coinListItemController');

module.exports = class CoinListController
{
  constructor(coinListRoot, list)
  {
    //coinList
    this.coinList = document.createElement('ul');
    this.coinList.className = "collection coinList";
    coinListRoot.appendChild(this.coinList);


    //coinListHeader
    this.coinListHeader = document.createElement('div');
    this.coinListHeader.className = "coinListHeader";
    this.coinListHeader.innerHTML = list.header;
    this.coinListHeader.onclick = () => {this.onClickHeader()};
    this.coinList.appendChild(this.coinListHeader);


    //coinListContent
    this.coinListContent = document.createElement('div');
    this.coinListContent.className = "coinListContent";
    this.coinList.appendChild(this.coinListContent);


    //coinListItem
    this.coinListItems = [];

    list.items.forEach((item)=>{
      this.coinListItems.push(
        new CoinListItemController(this.coinListContent, list.exchange, item.pairName, item.pairName_API, item.alarms, item.logoSrc)
      );
    });


    //expand coinListContent
    this.coinListContentExpand = true;
    this.coinListContent.style.maxHeight = this.coinListContent.scrollHeight+"px";
  }


  remove()
  {

  }


  /* ------------------ actions ------------------ */
  onClickHeader()
  {
    if(this.coinListContentExpand)
    {
      this.coinListContent.style.maxHeight = null;
    }
    else
    {
      this.coinListContent.style.maxHeight = this.coinListContent.scrollHeight+"px";
    }
    this.coinListContentExpand = !this.coinListContentExpand;
  }

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
