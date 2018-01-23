// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import printer3d_artifacts from '../../build/contracts/Printer3D.json'
import vendor_artifacts from '../../build/contracts/Vendor.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Printer3D = contract(printer3d_artifacts);
var Vendor = contract(vendor_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var vendor_account;
var printer_account;

window.App = {
  start: function () {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Printer3D.setProvider(web3.currentProvider);
    Vendor.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accounts) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accounts.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      vendor_account = accounts[0]; //vendor
      printer_account = accounts[1]; // printer

      //self.refreshBalance();
    });
  },

  setStatus: function (message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  setStatusVendor: function (message) {
    var statusAddItem = document.getElementById("statusAddItem");
    statusAddItem.innerHTML = message;
  },

  setStatusPayment: function (message) {
    var paymentDetails = document.getElementById("paymentDetails");
    paymentDetails.innerHTML = message;
  },

  setVendorBalance: function (message) {
    var vendorBalanceSpan = document.getElementById("vendorBalanceSpan");
    vendorBalanceSpan.innerHTML = message;
  },

  setPrinterBalance: function (message) {
    var printerBalanceSpan = document.getElementById("printerBalanceSpan");
    printerBalanceSpan.innerHTML = message;
  },


  unlockAccount: function () {
    var account = document.getElementById('unlock_account_address').value;
    var password = document.getElementById('unlock_account_password').value;
    web3.personal.unlockAccount(account, password, function (error, result) {
      if (error) {
        console.log('lock_unlock_result', error);
      } else {
        var str = account.substring(0, 20) + '...Unlocked';
        if (result) {
          console.log('lock_unlock_result', str);
        } else {
          str = 'Incorrect Password???';
          console.log('lock_unlock_result', str);
        }
      }
    });
  },

  placeOrder: function () {
    var self = this;

    //var partId = document.getElementById("partId").value;
    var partName = document.getElementById('partName').value;
    //var vendor_instance_address = document.getElementById('vendorAddress').value;
    var vendor_instance_address;
    Vendor.deployed().then(function (vendor_instance) {
      console.log("vendor instance detatils", vendor_instance.address);
      vendor_instance_address = vendor_instance.address;
      //watch shipmemt status event
      var shipmentEvent = vendor_instance.shipmentStatus();
      shipmentEvent.watch((error, result) => {
        if (!error) {
          self.setStatus("shipment status " + result.args.message + ", Price to Pay in ether's " + result.args.priceToPay + " To Address " + result.args.whomToPay);
          console.log("shipment status " + result.args.message + ", Price to Pay in ether's " + result.args.priceToPay + " To Address " + result.args.whomToPay);
        } else {
          self.setStatus("shipment status" + result.args.message + "Price to Pay in ether's" + result.args);
          console.log("error retriving event data" + error);
        }
      });
    }).then(function () {
      console.log("got the address of the contract")
    }).catch(function (e) {
      console.log(e);
    });


    Printer3D.deployed().then(function (printer_instance) {
      console.log("printer instance detatils", printer_instance.address);
      return printer_instance.callVendor(vendor_instance_address, partName, { from: printer_account });
    }).then(function () {
      console.log("Transaction complete!");
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error Placing the order; see log.");
    });

  },

  addItemToInventory: function () {
    var self = this;

    var price = parseInt(document.getElementById("price").value);
    var partId = parseInt(document.getElementById("partId_v").value);
    var itemName = document.getElementById("itemName").value;

    this.setStatusVendor("Initiating transaction... (please wait)");

    Vendor.deployed().then(function (vendor_instance) {
      console.log("vendor contract address while adding ", vendor_instance.address);
      return vendor_instance.addItemToInventory(partId, itemName, price, { from: printer_account, gas: 3000000 });
    }).then(function () {
      self.setStatusVendor("Transaction complete addItemToInventory!");
    }).catch(function (e) {
      console.log(e);
      self.setStatusVendor("Error Adding the Item");
    })
  },

  payToVendor: function () {
    var self = this;
    this.setStatusPayment("Initiating Payment... (please wait)");

    //var vendor_account = document.getElementById("addressToPay").value;  
    var priceInEther = parseInt(document.getElementById("priceToPay").value);
    var valueInWei = web3.toWei(priceInEther, 'ether');


    var printer;
    var transObject = {};
    transObject.from = printer_account;
    transObject.value = valueInWei;
    transObject.to = vendor_account;
    //transObject.gas = "";
    //transObject.gasPrice = "";
    //transObject.nonce = ""; 
    //transObject.data = ""


    web3.eth.sendTransaction(transObject, function (error, result) {
      if (!error) {
        self.setStatusPayment("Payment Done!!");
        console.log("Payment result", result);
      } else {
        console.log('send_transaction_error_or_result', error);
        self.setStatusPayment("error occured in payment checj logs");
      }
    });

  },


  getBalance: function (acc) {
    self = this;

    web3.eth.getBalance(acc, web3.eth.defaultBlock, function (error, result) {
      if (!error) {
        var bal = web3.fromWei(result, 'ether').toFixed(2);

        if (acc === vendor_account) {
          console.log("Balance is " + bal);
          self.setVendorBalance("Balance of Vendor " + bal + " ethers")
        } else {
          console.log("Balance is " + bal);
          self.setPrinterBalance("Balance Of Printer " + bal + " ethers")
        }
      }
      else {
        console.log("error fetching the balance")
      }
    });
  }

};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
