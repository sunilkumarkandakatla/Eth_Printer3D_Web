// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },

    production: {
      host: "etherygxwaff.westindia.cloudapp.azure.com",
      port: 8545,
      network_id: "1850", // Match any network id
      gas: 1000000,
      from : "0xd44ed184a0f93a8c1895f3058039c21b049af627"
      }
  }
}
