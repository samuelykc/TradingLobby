/*

<ul class="collection coinList">
  <div class="coinListHeader">
    <div class="coinListHeaderText">Binance</div>
    <div class="coinListHeaderPercent priceUp">+4.83%</div>
  </div>
  
  <div class="coinListContent">
    <li class="collection-item avatar coinListItem">...</li>
    <li class="collection-item avatar coinListItem">...</li>
  </div>
</ul>

*/

const mathExtend = require('../js/mathExtend');
const ModalBox = require('./ModalBox');
const CoinListItemController = require('./coinListItemController');

let listItemEditBox;   //common list item edit box shared across CoinListController



module.exports = class CoinListController
{
  constructor(coinListRoot, list)
  {
    //create listItemEditBox if not exist
    if(!listItemEditBox)
    {
      listItemEditBox = new ModalBox(document.body);
      listItemEditBox.modal.classList.add("listItemEditBox");
    }



    //coinList
    this.coinList = document.createElement('ul');
    this.coinList.className = "collection coinList";
    coinListRoot.appendChild(this.coinList);


    //coinListHeader
    this.coinListHeader = document.createElement('div');
    this.coinListHeader.className = "coinListHeader";
    this.coinListHeader.onclick = ()=>{this.onClickHeader()};
    this.coinList.appendChild(this.coinListHeader);

    //coinListEditBtn
    this.coinListEditBtn = document.createElement('i');
    this.coinListEditBtn.className = "material-icons coinListEditBtn";
    this.coinListEditBtn.innerText = "settings";
    this.coinListEditBtn.onclick = ()=>{this.onClickEditBtn()};
    this.coinListHeader.appendChild(this.coinListEditBtn);

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
    this.listData = list;
    this.coinListItems = [];
    this.coinListItemsPriceChangePercent = [];

    this.reprintCoinListItems();
  }


  remove()
  {

  }


  /* ------------------ actions ------------------ */
  onClickHeader()
  {
    if(event.target == this.coinListEditBtn) return;  //do nothing if the click is on coinListEditBtn

    this.setContentExpand(!this.listContentExpanded);
  }

  onClickEditBtn()
  {
    this.reprintListItemInputs(false);
    listItemEditBox.show();
  }


  /* ------------------ UI ------------------ */

  setContentExpand(expand)
  {
    if(expand)
    {
      this.coinListContent.style.maxHeight = this.coinListContent.scrollHeight+"px";
    }
    else
    {
      this.coinListContent.style.maxHeight = null;
    }
    this.listContentExpanded = expand;
  }

  reprintCoinListItems()   //those list items
  {
    //clear printed coinListItems
    this.coinListItems.forEach((item)=>{
      this.coinListContent.removeChild(item.coinListItem);
    });
    this.coinListItems = [];


    //reset group PriceChangePercent
    this.coinListItemsPriceChangePercent = [];
    this.coinListHeaderPercent.innerHTML = "";


    //perpare index & CB function for coinListItems
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


    //print coinListItems
    this.listData.items.forEach((item)=>{
      this.coinListItems.push(
        new CoinListItemController(this, this.coinListContent, this.listData.exchange, item, onItemPriceChangePercent, itemIndex++)
      );
    });


    //expand coinListContent
    this.setContentExpand(true);
  }

  reprintListItemInputs(listDataModified)
  {
    let modalContent = document.createElement("div");

    //print title
    let editListItemTitle = document.createElement('h5');
    editListItemTitle.innerText = "Edit Watchlist";
    editListItemTitle.className = "editListItemTitle";
    modalContent.appendChild(editListItemTitle);


    //print list item rows container
    let editListDiv = document.createElement("div");
    editListDiv.className = "coinListEditListDiv";
    modalContent.appendChild(editListDiv);


    //print list item rows
    if(this.listData.items) this.listData.items.forEach(
      (listItem) =>
      {
        //print list item container
        let editItemDiv = document.createElement('div');
        editItemDiv.className = "coinListEditItemDiv";
        editItemDiv.addEventListener('mousedown', mouseDownHandler);
        editListDiv.appendChild(editItemDiv);


        //print removeItemBtn
        let removeItemBtn = document.createElement('button');
        removeItemBtn.innerHTML = "<i class=\"material-icons\">remove</i>";
        removeItemBtn.className = "btn removeItemBtn red lighten-2";
        removeItemBtn.onclick = ()=>{
          this.listData.items.splice(this.listData.items.indexOf(listItem), 1);
          this.reprintListItemInputs(true);
        };
        editItemDiv.appendChild(removeItemBtn);


        //print inputDiv
        let inputDiv = document.createElement('div');
        inputDiv.className = "coinListEditItemInputDiv";
        editItemDiv.appendChild(inputDiv);


        //print pairNameInput
        let pairNameInput = document.createElement('input');
        pairNameInput.value = listItem.pairName;
        pairNameInput.placeholder = "Pair Name";
        pairNameInput.className = "pairNameInput";
        pairNameInput.addEventListener('change', (event) => {
            listItem.pairName = pairNameInput.value;
            listItem.pairName_API = this.listData.exchange == "Binance"? pairNameInput.value.replace('/', '').toLowerCase(): 
                                    this.listData.exchange == "FTX"? pairNameInput.value: "";
            listDataModified = true;
          }
        )
        inputDiv.appendChild(pairNameInput);


        //print pairIconInput
        let pairIconInput = document.createElement('input');
        pairIconInput.value = listItem.logoSrc;
        pairIconInput.placeholder = "Pair Icon (optional)";
        pairIconInput.className = "pairIconInput";
        pairIconInput.addEventListener('change', (event) => {
            listItem.logoSrc = pairIconInput.value;
            listDataModified = true;
          }
        )
        inputDiv.appendChild(pairIconInput);
      }
    );


    //print addItemBtn
    let addItemBtn = document.createElement('button');
    addItemBtn.innerHTML = "<i class=\"material-icons\">add</i>";
    addItemBtn.className = "btn addItemBtn light-green darken-1";
    addItemBtn.onclick = ()=>{
      this.listData.items.push({pairName: "", pairName_API: "", monitor: false, alarms: [], logoSrc: ""});
      this.reprintListItemInputs(true);
    };
    modalContent.appendChild(addItemBtn);

    listItemEditBox.setContent(modalContent);
    listItemEditBox.setOnCloseCB(()=>{if(listDataModified) this.reprintCoinListItems();});   //current solution would reprint UI when any input value has changed, even if it was chnaged back before exiting the modal
    

    //set dragFinishCallback
    dragFinishCallback = (fromPos, toPos)=>
    {
      if(fromPos == toPos) return;

      //move item data in listData.items
      let draggedData = this.listData.items[fromPos];
      let i;
      if(fromPos<toPos)
      {
        for(i=fromPos; i<toPos; i++)
        {
          this.listData.items[i] = this.listData.items[i+1];
        }
      }
      else
      {
        for(i=fromPos; i>toPos; i--)
        {
          this.listData.items[i] = this.listData.items[i-1];
        }
      }
      this.listData.items[toPos] = draggedData;

      listDataModified = true;
    }
  }
}













/* ------------------ code for handling drag ------------------ */
//reference: https://htmldom.dev/drag-and-drop-element-in-a-list/
//reference: https://github.com/phuoc-ng/html-dom/blob/master/demo/drag-and-drop-element-in-a-list/index.html
let draggingEle;
let draggingEleOriginalPos, draggingEleFinalPos;
let dragFinishCallback;

let placeholder;
let isDraggingStarted = false;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;

// Swap two nodes
const swap = function(nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
};

// Check if `nodeA` is above `nodeB`
const isAbove = function(nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return (rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2);
};

const mouseDownHandler = function(e) {
    //do not trigger dragging when pressing on child elements
    if(!e.target.classList.contains("coinListEditItemDiv")) return;

    draggingEle = e.target;
    draggingEleOriginalPos = Array.prototype.indexOf.call(draggingEle.parentNode.childNodes, draggingEle);
    console.log("draggingEleOriginalPos: "+draggingEleOriginalPos)

    // Calculate the mouse position
    const rect = draggingEle.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function(e) {
    const draggingRect = draggingEle.getBoundingClientRect();

    if (!isDraggingStarted) {
        isDraggingStarted = true;
        
        // Let the placeholder take the height of dragging element
        // So the next element won't move up
        placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
        draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
        placeholder.style.height = `${draggingRect.height}px`;
    }

    // Set position for dragging element
    draggingEle.style.position = 'absolute';
    draggingEle.style.top = `${e.pageY - y}px`; 
    draggingEle.style.left = `${e.pageX - x}px`;
    draggingEle.style.width = `${draggingRect.width}px`;

    // The current order
    // prevEle
    // draggingEle
    // placeholder
    // nextEle
    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling;
    
    // The dragging element is above the previous element
    // User moves the dragging element to the top
    if (prevEle && isAbove(draggingEle, prevEle)) {
        // The current order    -> The new order
        // prevEle              -> placeholder
        // draggingEle          -> draggingEle
        // placeholder          -> prevEle
        swap(placeholder, draggingEle);
        swap(placeholder, prevEle);
        return;
    }

    // The dragging element is below the next element
    // User moves the dragging element to the bottom
    if (nextEle && isAbove(nextEle, draggingEle)) {
        // The current order    -> The new order
        // draggingEle          -> nextEle
        // placeholder          -> placeholder
        // nextEle              -> draggingEle
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
    }
};

const mouseUpHandler = function() {
    // Remove the placeholder
    placeholder && placeholder.parentNode.removeChild(placeholder);

    draggingEle.style.removeProperty('position');
    draggingEle.style.removeProperty('top');
    draggingEle.style.removeProperty('left');
    draggingEle.style.removeProperty('width');

    draggingEleFinalPos = Array.prototype.indexOf.call(draggingEle.parentNode.childNodes, draggingEle);
    console.log("draggingEleFinalPos: "+draggingEleFinalPos)

    x = null;
    y = null;
    draggingEle = null;
    isDraggingStarted = false;

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    //callback
    if(dragFinishCallback) dragFinishCallback(draggingEleOriginalPos, draggingEleFinalPos);
};