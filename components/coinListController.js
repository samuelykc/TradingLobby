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
    let alarms = ['>= 55000', '>= 5% (15m)', '<= 48000', '<= 5% (1d)'];
    let logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAANlBMVEVHcEz/miT5lRv5lBr4lBr3kxr4kxr4kxr3kxr9lxz937z6w4D4pkL++PH////+7Nf6tGH80Z1gLiRMAAAACnRSTlMADz9ehavC4f8dTtIi3wAAA9xJREFUeAG804mBBFEEBFA0VSX/hDeAnfM38wJwsyMeVxZAUiIJVF7h9hMeCeohIreriITeQMZeduozGzV0Ul9gtk2K0tcq5tJDRxD76fdL6NIt1XbLpbuYdi6oAQw7lBqSdqKhMej98U+vITXoYA2lcWWfc2gBfP/8ZipoagnbPuDUGvr8/se3AK3C/P/NfmNq2R+t5oH0OAhD4QQ3Amrc/7BbwraM/dtPMvumepo16EMNXUSklJ0qpVJ2Ko28gCwiXOqoy+gGkKSLxoDoB6DKW/r+MNgdMwYAoNINaO+P1t1BYQwCEZC7Afb+0P7REAxwBzgQkC4LOuGVu+IISFeG9IqFwKbN6ASBbg2iJURgdzM3IxQBnEMsBMhvaTOKItC1Rg7A5F+xBhHoSoEDaHKk4kWgaw3EIJUD9ejjQqAr+asA+VrsQaBr8ceAWlgulB16RYIgVZUzNcqw5mAWMDmVVrgwiKbBKufiimIYTUNyJTWXD7axBuDXcQsWIvRJ3fHdUNwHc77DgO3vBm7BHCtFy9HFp8b7EA2F42ewEOvSk1QBXIbnfQQ+IgR7nZAGIHBigQEQ3EXgNEY1CIJtEAJd7MNwAxiEEdiXDIpQmEYh0FXcFE4jEIifwPSYhyJA3lA0P5ahCDRvJFoe60gETD5ESDBe7yAgn61a86ej1R0G+KAqb9Ws7rNyhUqCLYYAIM3/w4AqqJgwA+IIAP8H9IggAKhkUI8tjsCXxnAxvDfY7kQB26GP4Y8bACQCawcFKeEGrAMSwb4gZXxQso5JBDUQhboBy6BEQE0+ZeCQYI4jcJ6JFGwPp2G1QLaAE6ZHiiOwU4l0h88wApeZijLUGm1xBHZiL4Yb1JiQNtv5WK/neIZ1pzM2n9RSrrse9lHYW7MUy4B2Xa0Y1pw+YzUIMMolhEEAAkXrLfo8KkbnxXNkLMha7fz/UtARTQoXYeWfotxaoCpIwMIAyYVYS1ENjY03aFDZx3B+NcgDiA+CRhDmAXxU6jSiAR7wj+upjGyL5sCjJWoAk+/xcnFWJK3p+f/N+XaZ/I/FVL8+DSX3u93qqkj4NEJoDbxcpsC+QP39v1b434lF7O129SBQ99YQmRlRfI8j+fcFGM760BLFEkWABu0zvaII5JBe+AoxhMCQdaptPAIggc6kOACBdGORiWq9jcA8YpXrBgIrsMwGlwcW3ywFMACMoGEAfG/eDq4AgAAYigGw/8Km6IsV2uuPDxp90umj1j+y3nJB2EzSbvDCqj7v98DBEw+PXDzz8dCJUi8wQvfcz4NHTz49epXsF8DnHcPXNU+/NX4H/P8BC2PKINdSx6oAAAAASUVORK5CYII=';
    let item = new CoinListItemController(this.coinList, exchange, pairName, pairName_API, alarms, logoSrc);

    pairName = 'ETH/USDT';
    pairName_API = 'ethusdt';
    alarms = [];
    logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAHlBMVEVHcExifutkgOxifutifutifurAy/b///+Bl+6hsvK9JwfqAAAABXRSTlMAuT/fhRZUC3MAAAOZSURBVHjaxZsBsuQgCEQDKoH7X3jr79QWOz9mBmhn7AvwQqNR0aMm5k5ErbUxWmtE1JmPL4k7tTFVo86fDz7e6IMQ3NuIqfOm6K62mIFppEW8ODyEgIffh0ADEoHh+4DVkey3sUCNwc/H1UH3cRGaflwMpH+LDTSWiz4V33Q9Qcr+U8Lj8SPlJ6cYQAB/v56nyAAIwPhDfgAMIADr384fAFFgLGDj73wACDAaoflH/gHYohmJR0p6PgBSJgxeN/+fDmAjrmUFYA6QSgHBBeAJcADBf0w8cpJnAIN/zi1rgANkTWjLDHAA3ISsAVcAhUYCFaYABwBGAlCBDgDUITIFOACeAi5UoAO4yimgggEOUDKB4J+QA9RMYDQBDoCnoFCBLsFT0AEDHCBdh72+Dr0HKK1QGUiAAxRM4JID5zsASXsAVOAUQJMecMkAl9RTwHkHJAJgOQ8IMGAOILkdO1CBDlA0IVsCEgWwRBH0TAVGASRRBIQmwEop8CJoaAWqWrkOW6oGb7KvOkWIViEXDXDz9a+sZgLHAfQS3QGmDBoD6CUDngK5LJ2CfhCwEHeAKYKGhgEBOyEHmCOsBJAXE/9vmcVNoKNlDJCZdCKLmtCCAB4+AuAIqwDEw0cAHMHeA8QqUF5Ib2X2PgUhAJEkgOttCmIWWBlgVRFqDWDEihBEKIV3ABqumg9AfJ8JQ1JLAAwXDqAvfSiFd4Ae8l/dhwhAvKfXD47NhHZfCi/Ci6ErIidwBH0N8P+4scjGILwccB/0HuC5YiOL0sz/WKY+zLMf/RsfuRWJTYbkNPvR9Uhia3Y+dPXhJrxIcGvGyWX5ZUhes/9Q+IQi3yJ5jjUPLxpuG1B6a/Q8JGfZF7H4AUWvNCnUQ+r0Z5E4ouERJ5ghzMdm5qCw1fan9mLBYKmj0l7doetNeLHcQSWXD2lE5ysFTR6Xt/o5nbj5Ls22LztyUGYqv2T57uWew+rDRTuO6+lw8cqGRalvRwBBKb4nAD+yB47qqymwewCtdq/5251Thtr3eO+YwAsMOgcYYcFXOAy7wNAPF9y+BFqWSB3qFQC+zdVrBLABLvrORSZadZnNAZACwMug1LJ24WMRLAC8DMACwKdkbArGrxWfyYY9QIDcK/b46wmg+DiBApfbN1zv3/rAYfcTj72PXBojb8xwtd0PnXY/9dr92A0TDUi0+8Hj5iefux+9LhX87BcX97Y8+v6n3/sfv29//v8HwRsN0ET2sBAAAAAASUVORK5CYII=';
    let item2 = new CoinListItemController(this.coinList, exchange, pairName, pairName_API, alarms, logoSrc);

    pairName = 'BNB/USDT';
    pairName_API = 'bnbusdt';
    alarms = [];
    logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAJFBMVEVHcEz4wTP1vDH0uy/0ui/0ui/zui/53Jf////54qf30nf657dmMGbiAAAABnRSTlMAF0KFsc7rh3WQAAACnUlEQVR42sWbQXLEIAwEDUhysvz/vzlOhVRko7FrdNtcugMC2yAdpWi9DzN3j4hwd7PRezteDbCHxz/h420LwCOReI8eN+MNhzY8NsLHs3PRLbbD+sN4mUL3KIfzCs2CCiNzYQQdQzP6/Dzg31cNQvN4LLwVhj8ejU4Mv2QaLB4PYxc/b9AE6VdIRfAFBuBLDMCXGli8GrbBlxiMeD3Gs/vveT65K7d9/tfXvsH/iegFfsHA+QQAHwZ8GvQKHwZ8GniBXzRwbgLAhwE/CY3gw4BYCVbgEwZGZiD4MODy0At8ysCJAQCfMeiVDACfN7DSAIDPG/TKAIDPGxj4jeATBg2bIMEnDAbWIMEnDBwpWOd/f5cNkIaD4EeUDTAHFJ8ywAwQ/KoB5mAQfMIAc+AEnzTw+7vQJ+PDAPGJO7GRAvMvPzOY95NgRMEAfBgU+DF2tsG58BODubMZxu2YCR8G4N+JvSfhBD8zmFtPxB7bBuCvBtv86JcC5y/cXPlzrga//3BeCowL/gpcfq7A5efljjQOu+IvBp+Fvxh8Fv6VgR2W89NJn0i6JCnPXMBzPgySZTkzfm7gh6d8GCR8GCx8GBQEwIfByk8MwM8N/Mj4iQH4MFj49wyOhJ8YgA+DhJ8YyAXkU6BOQv0ylG9E8q1Y/jCSP47lLyTyVzL5S6n+tfww5YeJyT/N5B+n6s/zpj6gkB/RyA+p1Md08oNK+VGt/LCaP67njuvlFxbqKxv5pZX62k5+cam+upVfXquv7+UFDOoSDnURi7yMR13IpC7lkhezqcv51AWN+pJOqYHJy3rVhc3q0m51cbu6vF/c4KBu8VA3uajbfMSNTupWL3WzGxHydj++4VHc8iluehW3/cobn/Wt3wIJI5rfZe3/P1oiPn/e10XOAAAAAElFTkSuQmCC';
    let item3 = new CoinListItemController(this.coinList, exchange, pairName, pairName_API, alarms, logoSrc);
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
