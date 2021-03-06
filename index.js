$(document).ready(function() {
  checkUser();
  makeDeposit();
  makeWithdrawal();
  toggleBalance();
  accountHistory();
  logOut();

  // toggles sign in/registration on document ready
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

// functionality to toggle tabs
function openTab(evt, menuItem) {
  var i, tabcontent, tablinks;

  tabContent = $(".tabcontent");

  tabContent.each(function(){
    $(this).css("display", "none");
  })

  tabLinks = $(".tablinks");

  tabLinks.each(function(){
    $(this).toggleClass("");
  })

  $("#" + menuItem).css("display", "block");

  $(this).toggleClass("active");

  // if deposit or withdrawal is clicked, focus on input element
  if (menuItem === "deposit") {
    $("#depositField").focus();
  } else if (menuItem === "withdrawal") {
    $("#withdrawalField").focus();
  }
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
      while(passwordCount > 0){

        if(usersData[username]["password"] === password){
          currentUser = usersData[username];

          // take user to myAccount
          openMyAccount();
        } else {
          passwordCount--;
          document.getElementById("errorMsg").innerHTML = "Incorrect Password. Please try again."
        }
      }

      if(passwordCount === 0){
        document.getElementById("errorMsg").innerHTML = "Sorry. You have been locked out."
        // take user back to home page
        openTab(e, 'home');
      }

    } else { // if user is not in usersData, create account
      usersData[username] = new User (username, password);
      // setting user's transaction logs to array
      usersData[username]["log"] = []
      // setting starting balance at 0
      usersData[username]["accountBalance"] = 0
      // assign current user
      currentUser = usersData[username];
    } // end if user in usersData statement

    // take user to myAccount
    openMyAccount()

    // clear fields
    $(".sign-in-field").val("");
  })
}

function openMyAccount() {
  // toggle my account tab
  openTab("click", "myAccount")

  // load current user
  loadUser();
}

function loadUser() {
  // if there is a current user
  if (currentUser) {
    // render welcome msg
    $("#welcomeMsg").text("Welcome " + currentUser["username"] + "!");
    // calculate current balance
    calculateAccountBalance();
    // render account balance
    $("#accountBalance").text("$" + currentUser["accountBalance"]);
    // render "last update" msg
    $("#accountBalanceDate").text("Your account balance as of " + today);
    // render log out button
    $("#logtOutBtn").text("Log Out");
  };
}

// show/hide account balance
function toggleBalance() {
  var toggle = $('#container');
  var toggleContainer = $('#toggle-container');

  var toggleNumber;

  toggle.on("click", function(){
    toggleNumber = !toggleNumber;

    if (toggleNumber) {
  		toggleContainer.css("clipPath", "inset(0 0 0 50%)");
  		toggleContainer.css("backgroundColor", "#D74046");
  	} else {
      toggleContainer.css("clipPath", "inset(0 50% 0 0)");
      toggleContainer.css("backgroundColor", "#1E90FF");
  	}
    if (toggleNumber) {
      $("#accountBalance").text("$XX");
    } else {

      calculateAccountBalance();

      $("#accountBalance").text("$" + currentUser["accountBalance"]);
    }
  })
}

function makeDeposit(){
  $("#depositForm").on("submit", function(e){
    e.preventDefault();

    let form = $("#depositForm");
    // save data into array
    let data = form.serializeArray();

    // save deposit amount
    let amount = data[0]["value"];

    // record transaction
    currentUser["log"].push(['deposit', amount, Date.now()]);

    $(".transaction-input").val("");

    openMyAccount();
  });
}

function makeWithdrawal(){
  $("#withdrawal-form").on("submit", function(e){
    e.preventDefault();

    let form = $("#withdrawal-form");
    // save data into array
    let data = form.serializeArray();

    // save wtihdrawal amount
    let amount = data[0]["value"];

    // record transaction
    currentUser["log"].push(['withdrawal', amount, Date.now()]);

    $(".transaction-input").val("");

    openMyAccount();
  });
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

function accountHistory(){
  $("#historyBtn").on("click", function(){
    let accountHistoryDiv = $("#account-history")
    // clear div to start fresh every time
    accountHistoryDiv.empty();

    if (jQuery.isEmptyObject(currentUser)) {
      accountHistoryDiv.text("Sorry, please log in to view your account history");
    } else {
      // if there is a log
      if (currentUser["log"].length > 0) {
      let transactionHistory = currentUser["log"];

      let transactionList = document.createElement('ul');
      accountHistoryDiv.append(transactionList);
      // accountHistoryDiv.add('ul');
      var i;
      // for each transaction in transactionHistory
      for (i in transactionHistory) {
        let category = transactionHistory[i][0];
        let amount = transactionHistory[i][1];
        let date = new Date(transactionHistory[i][2]).toLocaleDateString("en-US");
        var listItem = document.createElement('li');

        // if category is deposit, print amount with +
        if (category === "deposit") {
          listItem.innerHTML = date + " + $" + amount;

        } else if (category === "withdrawal") {
        // else if category is withdrawal, print amount with -
          listItem.innerHTML = date + " - $" + amount;
        } // end if category statement

        transactionList.append(listItem);
        } // end for loop

      } else {
        accountHistoryDiv.text("Sorry, you have not made any transactions.");
      }
    }
  })
}

function logOut(){
  $("#logtOutBtn").on("click", function(e){
    // remove log out option
    $("#logtOutBtn").empty();
    // remove welcome msg
    $("#welcome-user").empty();
    // remove account balance & last update msg
    $("#accountBalance").empty();
    $("#accountBalanceDate").empty();

    // reset current user
    currentUser = [];

    // take user back to home page
    openTab(e, 'home');
  })
}
