/*

<li class="collection-item avatar coinListItem">
  <a href="https://www.binance.com/en/trade/BNB_USDT">
    <!-- <i class="circle green">BTC</i> -->
    <img class="circle green" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAANlBMVEVHcEz/miT5lRv5lBr4lBr3kxr4kxr4kxr3kxr9lxz937z6w4D4pkL++PH////+7Nf6tGH80Z1gLiRMAAAACnRSTlMADz9ehavC4f8dTtIi3wAAA9xJREFUeAG804mBBFEEBFA0VSX/hDeAnfM38wJwsyMeVxZAUiIJVF7h9hMeCeohIreriITeQMZeduozGzV0Ul9gtk2K0tcq5tJDRxD76fdL6NIt1XbLpbuYdi6oAQw7lBqSdqKhMej98U+vITXoYA2lcWWfc2gBfP/8ZipoagnbPuDUGvr8/se3AK3C/P/NfmNq2R+t5oH0OAhD4QQ3Amrc/7BbwraM/dtPMvumepo16EMNXUSklJ0qpVJ2Ko28gCwiXOqoy+gGkKSLxoDoB6DKW/r+MNgdMwYAoNINaO+P1t1BYQwCEZC7Afb+0P7REAxwBzgQkC4LOuGVu+IISFeG9IqFwKbN6ASBbg2iJURgdzM3IxQBnEMsBMhvaTOKItC1Rg7A5F+xBhHoSoEDaHKk4kWgaw3EIJUD9ejjQqAr+asA+VrsQaBr8ceAWlgulB16RYIgVZUzNcqw5mAWMDmVVrgwiKbBKufiimIYTUNyJTWXD7axBuDXcQsWIvRJ3fHdUNwHc77DgO3vBm7BHCtFy9HFp8b7EA2F42ewEOvSk1QBXIbnfQQ+IgR7nZAGIHBigQEQ3EXgNEY1CIJtEAJd7MNwAxiEEdiXDIpQmEYh0FXcFE4jEIifwPSYhyJA3lA0P5ahCDRvJFoe60gETD5ESDBe7yAgn61a86ej1R0G+KAqb9Ws7rNyhUqCLYYAIM3/w4AqqJgwA+IIAP8H9IggAKhkUI8tjsCXxnAxvDfY7kQB26GP4Y8bACQCawcFKeEGrAMSwb4gZXxQso5JBDUQhboBy6BEQE0+ZeCQYI4jcJ6JFGwPp2G1QLaAE6ZHiiOwU4l0h88wApeZijLUGm1xBHZiL4Yb1JiQNtv5WK/neIZ1pzM2n9RSrrse9lHYW7MUy4B2Xa0Y1pw+YzUIMMolhEEAAkXrLfo8KkbnxXNkLMha7fz/UtARTQoXYeWfotxaoCpIwMIAyYVYS1ENjY03aFDZx3B+NcgDiA+CRhDmAXxU6jSiAR7wj+upjGyL5sCjJWoAk+/xcnFWJK3p+f/N+XaZ/I/FVL8+DSX3u93qqkj4NEJoDbxcpsC+QP39v1b434lF7O129SBQ99YQmRlRfI8j+fcFGM760BLFEkWABu0zvaII5JBe+AoxhMCQdaptPAIggc6kOACBdGORiWq9jcA8YpXrBgIrsMwGlwcW3ywFMACMoGEAfG/eDq4AgAAYigGw/8Km6IsV2uuPDxp90umj1j+y3nJB2EzSbvDCqj7v98DBEw+PXDzz8dCJUi8wQvfcz4NHTz49epXsF8DnHcPXNU+/NX4H/P8BC2PKINdSx6oAAAAASUVORK5CYII="></img>
  </a>

  <ul class="coinSummary">
    <li class="pair">BTC/USDT</li>
    <li class="price priceUp">57,572.01</li>
    <li class="priceChange priceUp">+0.91% (+22.1091)</li>
    <br/>
    <li class="priceLow">51,452.34</li>
    <li><div class="priceBar"><div class="priceBarFill"></div></div></li>
    <li class="priceHigh">58,669.25</li>
  </ul>

  <p class="alarmSection">
    <label class="monitorCheckboxLabel">
      <input class="monitorCheckbox" type="checkbox" checked="checked" />
      <span>Monitor</span>
    </label>
    <button class="editAlarmsBtn">Edit</button>
    <div class="switch priceUp">
      <label>
        <input type="checkbox">
        <span class="lever"></span>
        <span class="alarmText">= 50</span>
      </label>
      <label>
        <input type="checkbox">
        <span class="lever"></span>
        <span class="alarmText">>= 55</span>
      </label>
    </div>
    <div class="switch priceDown">
      <label>
        <input type="checkbox">
        <span class="lever"></span>
        <span class="alarmText"><= 40</span>
      </label>
      <label class="pulse">
        <input type="checkbox">
        <span class="lever"></span>
        <span class="alarmText"><= 5% (15m)</span>
      </label>
    </div>
  </p>

  <a class="secondary-content btn-floating idleBell">
    <i class="material-icons tooltip">
      notifications_active
      <span class="tooltiptext">Tooltip text</span>
    </i>
  </a>
</li>

*/

const mathExtend = require('../js/mathExtend');
const dataFetcher = require('../dataFetcher');
const speechManager = require('../speechManager');

let exchangeTradeURL = {};
exchangeTradeURL["Binance"] = "https://www.binance.com/en/trade/";
exchangeTradeURL["FTX"] = "https://ftx.com/trade/";


module.exports = class CoinListItemController
{
  constructor(coinListItemRoot, exchange, pairName, pairName_API, alarms, logoSrc)
  {
    //coinListItem
    this.coinListItem = document.createElement('li');
    this.coinListItem.className = "collection-item avatar coinListItem";

    coinListItemRoot.appendChild(this.coinListItem);



    //coinListItem -> logoLink
    this.logoLink = document.createElement('a');
    this.logoLink.setAttribute("href", exchangeTradeURL[exchange] + pairName_API);
    this.logoLink.setAttribute("target", "_blank");
    this.coinListItem.appendChild(this.logoLink);

    //coinListItem -> coinSummary
    this.coinSummary = document.createElement('ul');
    this.coinSummary.className = "coinSummary";
    this.coinListItem.appendChild(this.coinSummary);

    //coinListItem -> alarmSection
    this.alarmSection = document.createElement('p');
    this.alarmSection.className = "alarmSection";
    this.coinListItem.appendChild(this.alarmSection);

    //coinListItem -> bell
    let bell = document.createElement('a');
    bell.className = "secondary-content btn-floating idleBell";  //idleBell / activeBell & pulse / missedBell
    bell.onclick = ()=>{this.onClickBell()};
    this.coinListItem.appendChild(bell);




    //coinListItem -> logoLink -> logo
    if(logoSrc)
    {
      this.logo = document.createElement('img');
      this.logo.className = "circle";
      this.logo.setAttribute("src", logoSrc);
    }
    else
    {
      this.logo = document.createElement('i');
      this.logo.className = "circle green";
      this.logo.innerHTML = pairName.substring(0, pairName.indexOf('/'));
    }
    this.logoLink.appendChild(this.logo);




    //coinListItem -> coinSummary -> pair
    this.pair = document.createElement('li');
    this.pair.className = "pair" + (pairName.length>10? " longName": "");
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




    //coinListItem -> alarmSection -> monitorCheckboxLabel
    this.monitorCheckboxLabel = document.createElement('label');
    this.monitorCheckboxLabel.className = "monitorCheckboxLabel";
    this.alarmSection.appendChild(this.monitorCheckboxLabel);

    //coinListItem -> alarmSection -> editAlarmsBtn
    this.editAlarmsBtn = document.createElement('button');
    this.editAlarmsBtn.className = "editAlarmsBtn";
    this.editAlarmsBtn.innerHTML = 'Edit';
    this.alarmSection.appendChild(this.editAlarmsBtn);

    //coinListItem -> alarmSection -> priceUp
    this.priceUp = document.createElement('div');
    this.priceUp.className = "switch priceUp";
    this.alarmSection.appendChild(this.priceUp);

    //coinListItem -> alarmSection -> priceDown
    this.priceDown = document.createElement('div');
    this.priceDown.className = "switch priceDown";
    this.alarmSection.appendChild(this.priceDown);


    //coinListItem -> alarmSection -> monitorCheckboxLabel -> monitorCheckbox
    this.monitorCheckbox = document.createElement('input');
    this.monitorCheckbox.className = "monitorCheckbox";
    this.monitorCheckbox.setAttribute("type", "checkbox");
    this.monitorCheckbox.setAttribute("checked", "checked");
    this.monitorCheckbox.onclick = () => {this.priceUp.style.display = this.priceDown.style.display = (this.priceUp.style.display=="none"? "block": "none");};
    this.monitorCheckboxLabel.appendChild(this.monitorCheckbox);

    //coinListItem -> alarmSection -> monitorCheckboxLabel -> monitorCheckboxSpan
    this.monitorCheckboxSpan = document.createElement('span');
    this.monitorCheckboxSpan.innerHTML = 'Monitor';
    this.monitorCheckboxLabel.appendChild(this.monitorCheckboxSpan);


    //coinListItem -> alarmSection -> priceDown
    //coinListItem -> alarmSection -> priceUp
    this.alarmObjects = [];

    if(alarms) alarms.forEach(
      (alarm) =>
      {
        let priceLabel = document.createElement('label');

        let priceCheckbox = document.createElement('input');
        priceCheckbox.setAttribute("type", "checkbox");
        priceCheckbox.checked = alarm.checked;
        priceCheckbox.addEventListener('change', (event) => {
            alarm.checked = priceCheckbox.checked;
          }
        )

        let priceSpan = document.createElement('span');
        priceSpan.className = "lever";

        let priceText = document.createElement('span');
        priceText.className = "alarmText";
        priceText.innerText = alarm.condition;

        priceLabel.appendChild(priceCheckbox);
        priceLabel.appendChild(priceSpan);
        priceLabel.appendChild(priceText);


        if(alarm.condition.startsWith('>'))
        {
          this.priceUp.appendChild(priceLabel);
        }
        else if(alarm.condition.startsWith('<'))
        {
          this.priceDown.appendChild(priceLabel);
        }

        this.alarmObjects.push({
          alarmDataRef: alarm,
          priceLabel: priceLabel, 
          priceCheckbox: priceCheckbox, 
          priceSpan: priceSpan, 
          priceText: priceText,
          isTriggering: false
        });
      }
    );




    //coinListItem -> bell -> icon
    let bellIcon = document.createElement('i');
    bellIcon.className = "material-icons tooltip";
    bellIcon.innerText = "notifications_active";
    bell.appendChild(bellIcon);

    //coinListItem -> bell -> icon -> tooltip
    let tooltip = document.createElement('span');
    tooltip.className = "tooltiptext";
    bellIcon.appendChild(tooltip);

    this.bellObject = {
      bell: bell, 
      state: 'idleBell', 
      tooltip: tooltip,
      triggeredAlarms: []
    }



    this.subscribe(exchange, pairName_API);
  }


  /* ------------------ actions ------------------ */
  onClickBell()
  {
    //stop alarms
    this.alarmObjects.forEach(
      (alarmObject) =>
      {
        if(alarmObject.isTriggering)
        {
          alarmObject.isTriggering = false;
          alarmObject.priceCheckbox.checked = false;
          alarmObject.alarmDataRef.checked = false;
        }
      }
    );

    //reset bell
    this.bellObject.state = 'idleBell';
    this.bellObject.bell.className = "secondary-content btn-floating idleBell";

    this.bellObject.triggeredAlarms = [];
  }

  onClickEditAlarm()
  {
    
  }



  /* ------------------ update ------------------ */
  subscribe(exchange, pairName_API)
  {
    let callback = 
      (data) =>
      {
        let lastLow = parseFloat(this.priceLow.innerHTML);
        let lastHigh = parseFloat(this.priceHigh.innerHTML);

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
        let priceChangeAmount = mathExtend.decimalAdjust('round', data.c-data.o, -Math.max(mathExtend.countDecimals(data.c), mathExtend.countDecimals(data.o)));
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


        //alarms
        if(this.monitorCheckbox.checked) this.checkAlarms(data, lastLow, lastHigh);
      };
    
    dataFetcher.subscribeMarketData({exchange: exchange, pairName: pairName_API, callback: callback});
  }

  checkAlarms(data, lastLow, lastHigh)
  {
    let activeAlarmCount = 0;

    this.alarmObjects.forEach(
      (alarm) =>
      {
        if(!alarm.priceCheckbox.checked) return;

        if(alarm.priceText.innerText.startsWith('>='))
        {
          if(alarm.priceText.innerText.includes('%'))
          {

          }
          else if(alarm.priceText.innerText.includes('high'))
          {
            alarm.isTriggering = (data.h > lastHigh || data.c >= lastHigh);

            if(alarm.isTriggering)
            {
              let speech = data.s.split("").join(" ") + ' hits the top';
              this.alarmTriggered(alarm, speech);
              activeAlarmCount++;
            }
          }
          else
          {
            let targetPrice = parseFloat(alarm.priceText.innerText.replace('>=', ''));
            alarm.isTriggering = (data.c >= targetPrice);

            if(alarm.isTriggering)
            {
              // let speech = data.s + (alarm.priceText.innerText.startsWith('>=')? 'above': 'below') + targetPrice;
              let speech = data.s.split("").join(" ") + ' above ' + targetPrice;
              this.alarmTriggered(alarm, speech);
              activeAlarmCount++;
            }
          }
        }
        else if(alarm.priceText.innerText.startsWith('<='))
        {
          if(alarm.priceText.innerText.includes('%'))
          {

          }
          else if(alarm.priceText.innerText.includes('low'))
          {
            alarm.isTriggering = (data.l < lastLow || data.c <= lastLow);

            if(alarm.isTriggering)
            {
              let speech = data.s.split("").join(" ") + ' hits the bottom';
              this.alarmTriggered(alarm, speech);
              activeAlarmCount++;
            }
          }
          else
          {
            let targetPrice = parseFloat(alarm.priceText.innerText.replace('<=', ''));
            alarm.isTriggering = (data.c <= targetPrice);

            if(alarm.isTriggering)
            {
              // let speech = data.s + (alarm.priceText.innerText.startsWith('>=')? 'above': 'below') + targetPrice;
              let speech = data.s.split("").join(" ") + ' below ' + targetPrice;
              this.alarmTriggered(alarm, speech);
              activeAlarmCount++;
            }
          }
        }
      }
    );

    this.setBell(activeAlarmCount);
  }

  alarmTriggered(alarm, speech)
  {
    //speech
    speechManager.addSpeech(speech);

    //bell tooltip
    if(this.bellObject.triggeredAlarms.indexOf(alarm.priceText.innerText) == -1)    //push only if the alarm is not alraeady in tooltip
    {
      this.bellObject.triggeredAlarms.push(alarm.priceText.innerText);
      this.bellObject.tooltip.innerHTML = this.bellObject.triggeredAlarms.join('<br/>');
    }
  }

  setBell(activeAlarmCount)
  {
    if(activeAlarmCount > 0)
    {
      //bell icon
      this.bellObject.state = 'activeBell';
      this.bellObject.bell.className = "secondary-content btn-floating activeBell pulse";
    }
    else
    {
      if(this.bellObject.state == 'activeBell')
      {
        //bell icon
        this.bellObject.state = 'missedBell';
        this.bellObject.bell.className = "secondary-content btn-floating missedBell";
      }
    }
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