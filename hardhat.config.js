require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

const { PRIVATEKEY, INFURA_APIKEY, TESTPK1, Etherscan_APIKEY } = require("./pvKey.js")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // latest solidity version
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },

  defaultNetwork: "mainnet",

  networks: {
    mylocalNode: {
      url: `http://127.0.0.1:8545/`,
      accounts: TESTPK1
    },
    sepolia : {
      url: `https://sepolia.infura.io/v3/${INFURA_APIKEY}`,
      accounts: PRIVATEKEY
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: PRIVATEKEY
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: Etherscan_APIKEY
  },

  mocha: {
    timeout: 100000000
  }
};
