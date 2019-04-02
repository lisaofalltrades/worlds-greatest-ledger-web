$(document).ready(function() {
  checkUser();
  makeDeposit();
  toggleBalance();

  document.getElementById("defaultOpen").click();
});

// ********* //
// variables //
// ********* //
const usersData = {};
let currentUser;

// today's date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

// ******* //
// classes //
// ******* //

class User {
  constructor(username, password, log, accountBalance) {
    this.username = username;
    this.password = password;
    this.log = log;
    this.accountBalance = accountBalance;
  }
}

// ********* //
// functions //
// ********* //

function loadUser() {

  if (currentUser) {
    document.getElementById('welcome-user').innerHTML = "Welcome " + currentUser["username"] + "!";

    calculateAccountBalance();
    document.getElementById('accountBalance').innerHTML = "$" + currentUser["accountBalance"];

    document.getElementById('accountBalanceDate').innerHTML = "Your account balance as of " + today;
  };
}

function openMyAccount() {
  // hide all content
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // open my account tab
  let welcomeMsg = document.getElementById("myAccount");
  welcomeMsg.style.display = "block";
  welcomeMsg.className += " active";

  // load current user
  loadUser();
}

function calculateAccountBalance() {
  // if there is a transaction history
  if (currentUser["log"].length > 0) {
    // set amount to 0 to properly recalculate every time
    currentUser["accountBalance"] = 0;

    let transactionHistory = currentUser["log"];

    var i;
    // for each transaction
    for (i in transactionHistory) {
      // assign category to variable category
      let category = transactionHistory[i][0];
      // convert string to float w/ two decimal points and assign to amount
      let amount = Math.round(transactionHistory[i][1] * 100) / 100;
      // if category is deposit, add to amount
      if (category === "deposit") {
        currentUser["accountBalance"] += amount
      // if category is withdrawal, subtract from amount
      } else if (category === "withdrawal") {
        currentUser["accountBalance"] -= amount
      } // end if statement checking category
    } // end for loop

  } else {
    currentUser["accountBalance"] = 0;
  }
}

function makeDeposit(){

  $("#depositForm").on("submit", function(e){
    e.preventDefault();

    let form = $("#depositForm");
    // save data into array
    let data = form.serializeArray();

    // save deposit amount
    let amount = data[0]["value"];
    console.log(amount);

    // record transaction
    currentUser["log"].push(['deposit', amount, Date.now()]);

    console.log(currentUser["log"]);
    
    openMyAccount();
  });

}

function checkUser() {
  $("#form-container").on("submit", "#new-session-form", function(e){
    e.preventDefault();

    // select new session form
    let form = $("#new-session-form");
    // save data into array
    let data = form.serializeArray();

    // save username & password variables
    let username = data[0]["value"];
    let password = data[1]["value"];

    // track number of pw guesses
    let passwordCount = 2;
    // if user is in usersData
    if (usersData[username]) {
      // check password
      console.log("Please wait while we verify your account...");

      while(passwordCount > 0){

        if(usersData[username]["password"] === password){
          console.log("logging in...");
          currentUser = usersData[username];
          showMenu();
        } else {
          password = readlineSync.question("Incorrect Password. Please enter your password again: ", { hideEchoBack: true });
          passwordCount--;
        }
      }

      if(passwordCount === 0){
        console.log(colors.yellow("You have reached maximum number of tries!"));
        openLedger();
      }

    } else { // if user is not in usersData, create account
      console.log("\nCreating account...\n");
      usersData[username] = new User (username, password);
      // setting user's transaction logs to array
      usersData[username]["log"] = []
      // setting starting balance at 0
      usersData[username]["accountBalance"] = 0
      console.log("Success! Welcome " + username + "!");
      // assign current user
      currentUser = usersData[username];
      console.log(currentUser);
    } // end if user in usersData statement

    console.log(currentUser);
    // take user to myAccount
    openMyAccount()
  })
}

// functionality for tabs
function openTab(evt, menuItem) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(menuItem).style.display = "block";
  evt.currentTarget.className += " active";
}

// show/hide account balance
function toggleBalance() {
  var toggle = document.getElementById('container');
  var toggleContainer = document.getElementById('toggle-container');
  var toggleNumber;

  toggle.addEventListener('click', function() {
  	toggleNumber = !toggleNumber;
  	if (toggleNumber) {
  		toggleContainer.style.clipPath = 'inset(0 0 0 50%)';
  		toggleContainer.style.backgroundColor = '#D74046';
  	} else {
  		toggleContainer.style.clipPath = 'inset(0 50% 0 0)';
  		toggleContainer.style.backgroundColor = 'dodgerblue';
  	}
    if (toggleNumber) {
      document.getElementById('accountBalance').innerHTML = "$XX";
    } else {
      calculateAccountBalance();
      document.getElementById('accountBalance').innerHTML = "$" + currentUser["accountBalance"];
    }
  });
}
