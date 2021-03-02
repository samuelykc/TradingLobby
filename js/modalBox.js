let modal;
let modalText;
let modalSpan;



function initializeModalBox()
{
  modal = document.getElementById("modalBox");
  modalText = document.getElementById("modalText");
  modalSpan = document.getElementsByClassName("close")[0];
  

  // When the user clicks on <span> (x), close the modal
  modalSpan.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function showModalBox(msg)
{
  modal.style.display = "block";
  modalText.innerHTML = msg;
}