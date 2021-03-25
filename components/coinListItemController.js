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

module.exports = class CoinListItemController
{
  constructor(coinList, exchange, pairName, alarms)
  {
    //coinListItem
    this.coinListItem = document.createElement('li');
    this.coinListItem.className = "collection-item avatar coinListItem";

    coinList.appendChild(this.coinListItem);



    //coinListItem -> logo
    this.logo = document.createElement('i');
    this.logo.className = "circle green";
    this.logo.innerHTML = pairName.substring(0, pairName.indexOf('/'));

    this.coinListItem.appendChild(this.logo);

    //coinListItem -> coinSummary
    this.coinSummary = document.createElement('ul');
    this.coinSummary.className = "coinSummary";

    this.coinListItem.appendChild(this.coinSummary);

    //coinListItem -> alarmSection
    this.alarmSection = document.createElement('p');
    // alarmSection.className = "";

    this.coinListItem.appendChild(this.alarmSection);

    //coinListItem -> bell
    this.bell = document.createElement('a');
    this.bell.className = "secondary-content btn-floating pulse red lighten-1 idleBell";
    this.bell.innerHTML = "<i class=\"material-icons\">notifications_active</i>";

    this.coinListItem.appendChild(this.bell);




    //coinListItem -> coinSummary -> pair
    this.pair = document.createElement('li');
    this.pair.innerHTML = pairName;
    this.coinSummary.appendChild(this.pair);

    //coinListItem -> coinSummary -> price
    this.price = document.createElement('li');
    this.coinSummary.appendChild(this.price);

    //coinListItem -> coinSummary -> priceChange
    this.priceChange = document.createElement('li');
    this.coinSummary.appendChild(this.priceChange);
  }


  remove()
  {

  }


  /* ------------------ actions ------------------ */
  onClickBell()
  {
    
  }

  onClickEditAlarm()
  {
    
  }

  onToggleAlarm(alarm)
  {
    
  }



  /* ------------------ update ------------------ */
  subscribe(alarm)
  {
    
  }

  subscribeCallback(data)
  {
    
  }

  alarmTriggered(alarm)
  {
    
  }
}
