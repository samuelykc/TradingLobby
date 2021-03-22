/*

<li class="collection-item avatar coinListItem">
  <i class="circle green">BTC</i>
  <ul class="coinSummary">
    <li>BTC/USDT</li>
    <li>57,572.01</li>
    <li>+0.91%</li>
  </ul>
  <p>
    <label>
      <input type="checkbox" checked="checked" />
      <span>Monitor</span>
    </label>
    <div class="switch priceUp">
      <label>
        <input type="checkbox">
        <span class="lever"></span>
        >= 50
      </label>
      <label class="pulse">
        <input type="checkbox">
        <span class="lever"></span>
        >= 55
      </label>
    </div>
    <div class="switch priceDown">
      <label>
        <input type="checkbox">
        <span class="lever"></span>
        <= 40
      </label>
      <label class="pulse">
        <input type="checkbox">
        <span class="lever"></span>
        <= 5% (15m)
      </label>
    </div>
  </p>
  <a class="secondary-content btn-floating pulse red lighten-1">
    <i class="material-icons">notifications_active</i>
  </a>
</li>

*/

class CoinListItemController {
  constructor(coinListItem, logo, coinSummary, alarmSection, bell, pair, price, priceChange) {
    this.coinListItem = coinListItem;
    
    this.logo = logo;
    this.coinSummary = coinSummary;
    this.alarmSection = alarmSection;
    this.bell = bell;
    
    this.pair = pair;
    this.price = price;
    this.priceChange = priceChange;
  }
}




module.exports = {
  create(coinList, pairName, alarms)
  {
    //coinListItem
    let coinListItem = document.createElement('li');
    coinListItem.className = "collection-item avatar coinListItem";

    coinList.appendChild(coinListItem);



    //coinListItem -> logo
    let logo = document.createElement('i');
    logo.className = "circle green";
    logo.innerHTML = pairName.substring(0, pairName.indexOf('/'));

    coinListItem.appendChild(logo);

    //coinListItem -> coinSummary
    let coinSummary = document.createElement('ul');
    coinSummary.className = "coinSummary";

    coinListItem.appendChild(coinSummary);

    //coinListItem -> alarmSection
    let alarmSection = document.createElement('p');
    // alarmSection.className = "";

    coinListItem.appendChild(alarmSection);

    //coinListItem -> bell
    let bell = document.createElement('a');
    bell.className = "secondary-content btn-floating pulse red lighten-1 idleBell";
    bell.innerHTML = "<i class=\"material-icons\">notifications_active</i>";

    coinListItem.appendChild(bell);




    //coinListItem -> coinSummary -> pair
    let pair = document.createElement('li');
    pair.innerHTML = pairName;
    coinSummary.appendChild(pair);

    //coinListItem -> coinSummary -> price
    let price = document.createElement('li');
    coinSummary.appendChild(price);

    //coinListItem -> coinSummary -> priceChange
    let priceChange = document.createElement('li');
    coinSummary.appendChild(priceChange);



    return new CoinListItemController(coinListItem, logo, coinSummary, alarmSection, bell, pair, price, priceChange);
  },

  remove()
  {

  },


  /* ------------------ actions ------------------ */
  onClickBell()
  {
    
  },

  onClickEditAlarm()
  {
    
  },

  onToggleAlarm(alarm)
  {
    
  },



  /* ------------------ update ------------------ */
  subscribe(alarm)
  {
    
  },

  subscribeCallback(data)
  {
    
  },

  alarmTriggered(alarm)
  {
    
  },
}
