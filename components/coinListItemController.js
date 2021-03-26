/*

<li class="collection-item avatar coinListItem">
  <i class="circle green">BTC</i>
  <ul class="coinSummary">
    <li class="pair">BTC/USDT</li>
    <li class="price priceUp">57,572.01</li>
    <li class="priceChange priceUp">+0.91% (+22.1091)</li>
    <br/>
    <li class="priceLow">51,452.34</li>
    <li><div class="priceBar"><div class="priceBarFill"></div></div></li>
    <li class="priceHigh">58,669.25</li>
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

const mathExtend = require('../js/mathExtend');
const dataFetcher = require('../dataFetcher');

module.exports = class CoinListItemController
{
  constructor(coinList, exchange, pairName, pairName_API, alarms)
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
    this.pair.className = "pair";
    this.pair.innerHTML = pairName;
    this.coinSummary.appendChild(this.pair);

    //coinListItem -> coinSummary -> price
    this.price = document.createElement('li');
    this.price.className = "price";
    this.coinSummary.appendChild(this.price);

    //coinListItem -> coinSummary -> priceChange
    this.priceChange = document.createElement('li');
    this.priceChange.className = "priceChange";
    this.coinSummary.appendChild(this.priceChange);

    //coinListItem -> coinSummary -> <br/>
    this.coinSummary.appendChild(document.createElement('br'));

    //coinListItem -> coinSummary -> priceLow
    this.priceLow = document.createElement('li');
    this.priceLow.className = "priceLow";
    this.coinSummary.appendChild(this.priceLow);

    //coinListItem -> coinSummary -> priceBar
    this.priceBar = document.createElement('li');
    this.priceBar.className = "priceBar";
    this.coinSummary.appendChild(this.priceBar);

    //coinListItem -> coinSummary -> priceHigh
    this.priceHigh = document.createElement('li');
    this.priceHigh.className = "priceHigh";
    this.coinSummary.appendChild(this.priceHigh);


    //coinListItem -> coinSummary -> priceBar -> priceBarFill
    this.priceBarFill = document.createElement('div');
    this.priceBarFill.className = "priceBarFill";
    this.priceBar.appendChild(this.priceBarFill);



    this.subscribe(pairName_API);
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
  subscribe(pairName_API)
  {
    let callback = (
      function(data)
      {
        //close price
        let lastPrice = this.price.innerHTML;
        let newPrice = parseFloat(data.c).toString();

        //close price UI
        this.price.innerHTML = newPrice;
        if(lastPrice && lastPrice!=newPrice)
        {
          this.price.className = parseFloat(newPrice)>parseFloat(lastPrice)? "price priceUp" : "price priceDown";
        }
        else
        {
          this.price.className = "price";
        }


        //24h Change
        let priceChangePercent = mathExtend.decimalAdjust('round', ((data.c/data.o)-1)*100.0, -2);
        let priceChangeAmount = mathExtend.decimalAdjust('round', data.c-data.o, -4);
        let priceChangeSign = (priceChangeAmount>0? '+': '');

        //24h Change UI
        this.priceChange.innerHTML = priceChangeSign + priceChangePercent + '% ('+
                                    priceChangeSign + priceChangeAmount +')';
        this.priceChange.className = (data.c==data.o? 'priceChange' :
                                      data.c>data.o? "priceChange priceUp" : "priceChange priceDown");


        //priceBar
        let priceBarFillValue = (data.c - data.l)/(data.h - data.l);

        //priceBar UI
        this.priceLow.innerHTML = parseFloat(data.l).toString();
        this.priceHigh.innerHTML = parseFloat(data.h).toString();
        this.priceBarFill.style.width = priceBarFillValue*100.0 + '%';
        this.priceBarFill.style.backgroundColor = this.HSVtoRGB(priceBarFillValue*0.3,
                                                  Math.abs(priceBarFillValue - 50)/50,
                                                  0.8);
      }
    ).bind(this); // we call bind with the `this` value of the enclosing function
    

    dataFetcher.subscribeMarketData({pairName: pairName_API, callback: callback});
    // console.log('subscribe');
  }

  alarmTriggered(alarm)
  {
    
  }




  HSVtoRGB(h, s, v)
  {
      var r, g, b, i, f, p, q, t;
      if (arguments.length === 1) {
          s = h.s, v = h.v, h = h.h;
      }
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
          case 0: r = v, g = t, b = p; break;
          case 1: r = q, g = v, b = p; break;
          case 2: r = p, g = v, b = t; break;
          case 3: r = p, g = q, b = v; break;
          case 4: r = t, g = p, b = v; break;
          case 5: r = v, g = p, b = q; break;
      }
      return 'rgb('+ r*255 +', '+ g*255 +', '+ b*255 +')'
      // return {
      //     r: Math.round(r * 255),
      //     g: Math.round(g * 255),
      //     b: Math.round(b * 255)
      // };
  }
}

