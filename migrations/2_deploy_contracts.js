var Vendor = artifacts.require("./Vendor.sol");
var Printer3D = artifacts.require("./Printer3D.sol");

module.exports = function(deployer, network, accounts ) {

  if (network == "development") {
    deployer.deploy(Vendor, "ACME", {gas: 4612388, from: accounts[0]});
    deployer.deploy(Printer3D, 33333, "HPJetFusion", {gas: 4612388, from: accounts[1]});
  }
};
