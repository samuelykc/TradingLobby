/*

<ul class="collection coinList">
  <div class="coinListHeader">Binance</div>
  
  <div class="coinListContent">
    <li class="collection-item avatar coinListItem">...</li>
    <li class="collection-item avatar coinListItem">...</li>
  </div>
</ul>

*/

const mathExtend = require('../js/mathExtend');
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
    this.coinListHeader.onclick = () => {this.onClickHeader()};
    this.coinList.appendChild(this.coinListHeader);

    //coinListHeaderText
    this.coinListHeaderText = document.createElement('div');
    this.coinListHeaderText.className = "coinListHeaderText";
    this.coinListHeaderText.innerHTML = list.header;
    this.coinListHeader.appendChild(this.coinListHeaderText);

    //coinListHeaderPercent
    this.coinListHeaderPercent = document.createElement('div');
    this.coinListHeaderPercent.className = "coinListHeaderPercent";
    this.coinListHeader.appendChild(this.coinListHeaderPercent);



    //coinListContent
    this.coinListContent = document.createElement('div');
    this.coinListContent.className = "coinListContent";
    this.coinList.appendChild(this.coinListContent);


    //coinListItem
    this.coinListItems = [];
    this.coinListItemsPriceChangePercent = [];
    let itemIndex = 0;

    let onItemPriceChangePercent = (itemIndex, percent)=>
    {
      //store data
      this.coinListItemsPriceChangePercent[itemIndex] = percent;

      //set group PriceChangePercent if all items have data returned
      if(this.coinListItemsPriceChangePercent.length < this.coinListItems.length) return;

      let percentSum = 0.0;
      this.coinListItemsPriceChangePercent.forEach((percent)=>{
        if(!percent) return;
        percentSum += percent;
      });

      this.coinListHeaderPercent.innerHTML = (percentSum>0? '+': '') + mathExtend.decimalAdjust('round', percentSum / this.coinListItems.length, -2) + "%";
      this.coinListHeaderPercent.className = "coinListHeaderPercent" + (percentSum>0? " priceUp":
                                                                        (percentSum<0? " priceDown" : ""));
    }

    list.items.forEach((item)=>{
      this.coinListItems.push(
        new CoinListItemController(this.coinListContent, list.exchange, item, onItemPriceChangePercent, itemIndex++)
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
}
