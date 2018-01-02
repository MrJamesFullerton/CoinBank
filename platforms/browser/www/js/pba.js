const WHITELIST = ["insane", "icon", "icon [futures]", "hmp", "xng"];

function init() {
  $('[data-toggle="tooltip"]').tooltip();

  //timers
  var infoTimer = null;
  var loadTimer = null;
  $("input").on("keydown", function entry(ele) {
    if (ele.keyCode == 13) {
      loadCoins();
    } else {
      clearTimeout(infoTimer); 
      clearTimeout(loadTimer); 
      infoTimer = setTimeout(updateInfo, 300);
      loadTimer = setTimeout(loadCoins, 30000);
    }
  });

  setTimeout(updateInfo, 250);
}

function arrayOfAll() {
  var newCoins = [];
  //begin at 1 to ignore header row
  for (var i = 1; i < $("#balanceTable")[0].rows.length-1; i++) {

    //allow amount to be passed as string if necessary, but numerically preferred
    //set up amountOut
    var amountOut;
    if (isNaN($("#balanceTable")[0].rows[i].getElementsByTagName("input")[1].value)) {
      amountOut = $("#balanceTable")[0].rows[i].getElementsByTagName("input")[1].value;
    } else {
      amountOut = Number($("#balanceTable")[0].rows[i].getElementsByTagName("input")[1].value);
    }

    //set up full array
    //if ($("#balanceTable")[0].rows[i].getElementsByClassName("symbol-label")[0].innerHTML == "") {
    newCoins.push([$("#balanceTable")[0].rows[i].getElementsByTagName("input")[0].value, amountOut]);
    //} else {
    //  newCoins.push([$("#balanceTable")[0].rows[i].getElementsByClassName("symbol-label")[0].innerHTML.toLowerCase(), amountOut]);
    //}
  }
  return newCoins;
}

function loadCoins() {
  var newCoins = arrayOfAll();
  window.location.href = "?coins=" + JSON.stringify(newCoins) + "&exco=" + $("#exco-factor")[0].value;
}

function addRow(rowNum) {
  var newCoins = arrayOfAll();
  newCoins.splice(rowNum, 0, ["",""]); //add a new blank entry at the given index
  window.location.href = "?coins=" + JSON.stringify(newCoins) + "&exco=" + $("#exco-factor")[0].value;
}

function remRow(rowNum) {
  var newCoins = arrayOfAll();
  newCoins.splice(rowNum, 1); //remove the entry at the given index
  window.location.href = "?coins=" + JSON.stringify(newCoins) + "&exco=" + $("#exco-factor")[0].value;
}

function updateInfo() {
  $.get("cmcticker.json", function(data, status) {
    //TODO: fix this error handling (doesn't work)
    if ((status != "success") || (data == "")) {
      alert("Unable to pull from coinmarketcap api");
    }
    var total_usd = [];
    var total_btc = [];
    var hourP = [];
    var dayP = [];
    var weekP = [];
    var grandTotalUSD = 0;
    var grandTotalBTC = 0;
    for (var i=1; i < $("#balanceTable")[0].rows.length - 1; i++) {
      var amount = $("#balanceTable")[0].rows[i].getElementsByClassName("amount")[0].value;
      //check amounts for non-numeric charaters and add error border if necessary
      if (isNaN($("#balanceTable")[0].rows[i].getElementsByClassName("amount")[0].value)) {
        $("#balanceTable")[0].rows[i].getElementsByClassName("amt-form")[0].classList.add("has-error");
        amount = 0;
      } else {
        $("#balanceTable")[0].rows[i].getElementsByClassName("amt-form")[0].classList.remove("has-error");
      }
      
      $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-button")[0].href = "";
      $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-button")[0].classList.add("disabled");
      $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-label")[0].innerHTML = "";
      if ($("#balanceTable")[0].rows[i].getElementsByClassName("currency")[0].value == "") {
        $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-icon")[0].src = "empty.png";
      } else {
        $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-icon")[0].src = "unknown.png";
      }
      $("#balanceTable")[0].rows[i].getElementsByClassName("price-usd")[0].innerHTML = "";
      $("#balanceTable")[0].rows[i].getElementsByClassName("price-btc")[0].innerHTML = "";
      $("#balanceTable")[0].rows[i].getElementsByClassName("total-usd")[0].innerHTML = "";
      $("#balanceTable")[0].rows[i].getElementsByClassName("total-btc")[0].innerHTML = "";
      $("#balanceTable")[0].rows[i].getElementsByClassName("hour-%")[0].innerHTML = "";
      $("#balanceTable")[0].rows[i].getElementsByClassName("day-%")[0].innerHTML = "";
      $("#balanceTable")[0].rows[i].getElementsByClassName("week-%")[0].innerHTML = "";
      for (var j=data.length-1; j >= 0; j--) {
        if ((data[j].name.toLowerCase() == $("#balanceTable")[0].rows[i].getElementsByClassName("currency")[0].value.toLowerCase()) || (data[j].symbol.toLowerCase() == $("#balanceTable")[0].rows[i].getElementsByClassName("currency")[0].value.toLowerCase())){
          total_usd[i] = data[j].price_usd * amount;
          total_btc[i] = data[j].price_btc * amount;
          hourP[i] = data[j].percent_change_1h;
          dayP[i] = data[j].percent_change_24h;
          weekP[i] = data[j].percent_change_7d;
          grandTotalUSD += total_usd[i];
          grandTotalBTC += total_btc[i];
          if (document.activeElement != $("#balanceTable")[0].rows[i].getElementsByClassName("currency")[0]) {
            //fuck InsaneCoin... //DEPRECATED - leaving in case of any other same-name coins
            if (!WHITELIST.includes($("#balanceTable")[0].rows[i].getElementsByClassName("currency")[0].value.toLowerCase())) {
              $("#balanceTable")[0].rows[i].getElementsByClassName("currency")[0].value = data[j].name;
            }
          }
          console.log(data[j].name);
          $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-button")[0].href = "https://coinmarketcap.com/currencies/" + data[j].id;
          $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-button")[0].classList.remove("disabled");
          $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-label")[0].innerHTML = data[j].symbol;
          $("#balanceTable")[0].rows[i].getElementsByClassName("symbol-icon")[0].src = "https://files.coinmarketcap.com/static/img/coins/64x64/" + data[j].id + ".png";
          $("#balanceTable")[0].rows[i].getElementsByClassName("price-usd")[0].innerHTML = "<strong>$</strong>" + Number(data[j].price_usd).toFixed(4);
          $("#balanceTable")[0].rows[i].getElementsByClassName("price-btc")[0].innerHTML = "<span class='glyphicon glyphicon-bitcoin'></span>" + Number(data[j].price_btc).toFixed(8);
          $("#balanceTable")[0].rows[i].getElementsByClassName("total-usd")[0].innerHTML = "<strong>$</strong>" + Number(total_usd[i]).toFixed(2);
          $("#balanceTable")[0].rows[i].getElementsByClassName("total-btc")[0].innerHTML = "<span class='glyphicon glyphicon-bitcoin'></span>" + Number(total_btc[i]).toFixed(4);
          $("#balanceTable")[0].rows[i].getElementsByClassName("hour-%")[0].innerHTML = hourP[i] + "%";
          $("#balanceTable")[0].rows[i].getElementsByClassName("day-%")[0].innerHTML = dayP[i] + "%";
          $("#balanceTable")[0].rows[i].getElementsByClassName("week-%")[0].innerHTML = weekP[i] + "%";
        }
      }
    }

    //finalize and set grand totals
    grandTotalUSD *= (1 - ($("#exco-factor")[0].value / 100));
    grandTotalBTC *= (1 - ($("#exco-factor")[0].value / 100));
    $("#balanceTable")[0].getElementsByClassName("grand-total-usd")[0].innerHTML = "$" + grandTotalUSD.toFixed(2);
    $("#balanceTable")[0].getElementsByClassName("grand-total-btc")[0].innerHTML = "<span class='glyphicon glyphicon-bitcoin'></span>" + grandTotalBTC.toFixed(4);
    document.title = grandTotalUSD.toFixed(0) + " - poorboy's accountant";

    //set top bar info
    $("#top-bar")[0].getElementsByClassName("grand-total-usd")[0].innerHTML = "$" + grandTotalUSD.toFixed(0);
    $("#top-bar")[0].getElementsByClassName("grand-total-btc")[0].innerHTML = "<span class='glyphicon glyphicon-bitcoin'></span>" + grandTotalBTC.toFixed(3);
    var clock = new Date();
    $("#clock")[0].innerHTML = (((clock.getHours()+11)%12)+1) + ":" + clock.toLocaleTimeString().split(":")[1] + " " + ((clock.getHours() < 12)? "AM" : "PM");

    //populate "portion" column and colorize %s
    for (var i=1; i < $("#balanceTable")[0].rows.length - 1; i++) {
      var portion = total_btc[i] / grandTotalBTC;
      var opacity = 0;
      if (!isNaN(portion)) {
        $("#balanceTable")[0].rows[i].getElementsByClassName("portion")[0].innerHTML = Number(portion * 100).toFixed(1) + "%";

        //hour - if positive green else red
        opacity = (0.6*portion) * ((1/2)*Math.pow(Math.abs(hourP[i]), 0.5));
        if (hourP[i] > 0) {
          $("#balanceTable")[0].rows[i].getElementsByClassName("hour-%")[0].style.backgroundColor = "hsla(120, 39%, 54%, " + opacity + ")";
        } else {
          $("#balanceTable")[0].rows[i].getElementsByClassName("hour-%")[0].style.backgroundColor = "hsla(2, 64%, 58%, " + opacity + ")";
        }

        //day - if positive green else red
        opacity = (0.6*portion) * ((1/2)*Math.pow(Math.abs(dayP[i]), 0.5));
        if (dayP[i] > 0) {
          $("#balanceTable")[0].rows[i].getElementsByClassName("day-%")[0].style.backgroundColor = "hsla(120, 39%, 54%, " + opacity + ")";
        } else {
          $("#balanceTable")[0].rows[i].getElementsByClassName("day-%")[0].style.backgroundColor = "hsla(2, 64%, 58%, " + opacity + ")";
        }

        //week - if positive green else red
        opacity = (0.6*portion) * ((1/2)*Math.pow(Math.abs(weekP[i]), 0.5));
        if (weekP[i] > 0) {
          $("#balanceTable")[0].rows[i].getElementsByClassName("week-%")[0].style.backgroundColor = "hsla(120, 39%, 54%, " + opacity + ")";
        } else {
          $("#balanceTable")[0].rows[i].getElementsByClassName("week-%")[0].style.backgroundColor = "hsla(2, 64%, 58%, " + opacity + ")";
        }
      }
    }
  });
}

function scrollToBottom() {
  setTimeout(function() {window.scrollTo(0,document.body.scrollHeight)}, 250);
}

function headChevronFlip() {
  if ($("#head-collapse").hasClass("in")) {
    //flip down
    $("#head-chevron").addClass("head-chevron-flip");
    var chevi = setTimeout(function() {
      $("#head-chevron").removeClass("head-chevron-flip");
      $("#head-chevron").removeClass("glyphicon-chevron-up");
      $("#head-chevron").addClass("glyphicon-chevron-down");
    }, 420);
  } else {
    //flip up
    $("#head-chevron").addClass("head-chevron-flip");
    var chevi = setTimeout(function() {
      $("#head-chevron").removeClass("head-chevron-flip");
      $("#head-chevron").removeClass("glyphicon-chevron-down");
      $("#head-chevron").addClass("glyphicon-chevron-up");
    }, 420);
  }
}

//refresh every 10sec
var reloadInterval = setInterval(updateInfo, 10000);