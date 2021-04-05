/*

<div id="modalBox" class="modal">
  <!-- Modal content -->
  <div class="modalContent">
    <span class="close">&times;</span>
    <p></p>
  </div>
</div>

*/

module.exports = class ModalBox
{
  constructor(modalBoxRoot)
  {
    this.modal = document.createElement("div");
    this.modal.className = "modal";
    window.onclick = (event)=>{  // When the user clicks anywhere outside of the modal, close it
      if (event.target == this.modal)
      {
        this.modal.style.display = "none";
        if(this.onCloseCB) this.onCloseCB();
      }
    }
    modalBoxRoot.appendChild(this.modal);




    this.modalContent = document.createElement("div");
    this.modalContent.className = "modalContent";
    this.modal.appendChild(this.modalContent);




    this.modalSpan = document.createElement("span");
    this.modalSpan.className = "close";
    this.modalSpan.innerHTML = "&times;";
    this.modalSpan.onclick = ()=>{  // When the user clicks on <span> (x), close the modal
      this.modal.style.display = "none";
      if(this.onCloseCB) this.onCloseCB();
    }
    this.modalContent.appendChild(this.modalSpan);


    this.modalText = document.createElement("p");
    this.modalContent.appendChild(this.modalText);
  }


  remove()
  {

  }

  show()
  {
    this.modal.style.display = "block";
  }

  setOnCloseCB(onCloseCB)
  {
    this.onCloseCB = onCloseCB;
  }



  /* ------------------ content ------------------ */
  setText(msg)
  {
    //remove content
    if(this.modalContent.childNodes.length > 2) this.modalContent.removeChild(this.modalContent.childNodes[this.modalContent.childNodes.length - 1]);
    
    //set text
    this.modalText.innerHTML = msg;
  }

  setContent(content)
  {
    //remove text
    this.modalText.innerHTML = '';

    //set content
    if(this.modalContent.childNodes.length > 2) this.modalContent.removeChild(this.modalContent.childNodes[this.modalContent.childNodes.length - 1]);
    this.modalContent.appendChild(content);
  }
}