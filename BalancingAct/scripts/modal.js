var settingsModal;
var settingsBtn;
var span;

function initModals(stats) {
  //Settings Modal
  // Get the modal
  settingsModal = document.getElementById("settingsModal");
  // Get the button that opens the modal
  settingsBtn = document.getElementById("settingBtn");
  // Get the <span> element that closes the modal
  settingsSpan = document.getElementById("settingsClose");
  // When the user clicks on the button, open the modal
  settingsBtn.onclick = function() {
    clockStop(timer);
    settingsModal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  settingsSpan.onclick = function() {
    settingsModal.style.display = "none";
    clockStart(timer);
  }

  //Stats Modal
  // Get the modal
  statsModal = document.getElementById("statsModal");
  // Get the button that opens the modal
  statsBtn = document.getElementById("statsBtn");
  // Get the <span> element that closes the modal
  statsSpan = document.getElementById("statsClose");
  // When the user clicks on the button, open the modal
  statsBtn.onclick = function() {
    clockStop(timer);
    populateStatsTable(stats);
    statsModal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  statsSpan.onclick = function() {
    statsModal.style.display = "none";
    clockStart(timer);
  }

  //New Game Modal
  // Get the modal
  gameModal = document.getElementById("newGameModal");
  // Get the button that opens the modal
  newGameBtn = document.getElementById("newGameBtn");
  // Get the <span> element that closes the modal
  newGameSpan = document.getElementById("newGameClose");
  // When the user clicks on the button, open the modal
  newGameBtn.onclick = function() {
    settingsModal.style.display = "none";
    gameModal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  newGameSpan.onclick = function() {
    gameModal.style.display = "none";
    clockStart(timer);
  }

  //Win Modal
  winModal = document.getElementById("winModal");

  winGameBtn = document.getElementById("winNewGame");
  winGameBtn.onclick = function() {
    winModal.style.display = "none";
    gameModal.style.display = "block";
  }
}
