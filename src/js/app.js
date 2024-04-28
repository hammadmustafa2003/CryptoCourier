App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    console.log('Web3 initialized', web3);

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

    });
    $(document).ready(function(){
      $("#account-number").html(web3.eth.accounts[0]);
    });
    return App.initContract();
  },

  initContract: function () {
    $.getJSON('CourierManager.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var courierManagerArtifact = data;
      App.contracts.courierManager = TruffleContract(courierManagerArtifact);

      // Set the provider for our contract
      App.contracts.courierManager.setProvider(App.web3Provider);
    });
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '#addCourierButton', App.addCourier);
    // $(document).on('click', '#removeCourierButton', App.removeCourier);
    $(document).on('click', '#viewCouriersButton', App.viewCouriers);
  },

  addCourier: async function (event) {
    event.preventDefault();
    const title = document.getElementById('courierTitle').value;
    const description = document.getElementById('courierDescription').value;
    const value = web3._extend.utils.toWei(document.getElementById('courierValue').value, 'ether');

    var courierManagerInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      App.contracts.courierManager.deployed().then(async function (instance) {
        courierManagerInstance = instance;
        let retVal = await courierManagerInstance.addCourier(title, description, { from: accounts[0], value: value });
        let events = await courierManagerInstance.allEvents();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  // removeCourier: async function (event) {
  //   const id = document.getElementById('courierId').value;
  //   await courierManager.methods.removeCourier(id).send({ from: accounts[0] });
  // },

  viewCouriers: async function (event) {
    event.preventDefault();


    var courierManagerInstance;
    const courierList = document.getElementById('courierList');
    courierList.innerHTML = '';
    App.contracts.courierManager.deployed().then(function (instance) {
      courierManagerInstance = instance;

      return courierManagerInstance.getAddresses.call();
    }).then(function (address) {
      console.log(address);
      for (i = 0; i < address.length; i++) {
        if (address[i] !== '0x0000000000000000000000000000000000000000') {
          console.log(i);
          courierManagerInstance.getCourier(i).then(function (courier) {
            console.log(courier);
            const card = document.createElement('div');
            card.className = 'card parcel-card';
            card.style.width = '18rem';
            card.innerHTML =   
            `<img class="card-img-top" height="100px" width="100px" src="/images/courier.png" alt="Card image cap">
            <h2>${courier[1]}</h2>
            <p>${courier[2]}</p>`;
            // li.textContent = `ID: ${i}, Title: ${courier[1]}, Description: ${courier[2]}`;
            courierList.appendChild(card);
          });
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });


  }

  //   const couriers = await courierManager.methods.getAllCouriers().call();
  //   const courierList = document.getElementById('courierList');
  //   courierList.innerHTML = '';
  //   couriers.forEach((courier) => {
  //     const li = document.createElement('li');
  //     li.textContent = `ID: ${courier.id}, Title: ${courier.title}, Description: ${courier.description}`;
  //     courierList.appendChild(li);
  //   });
  // }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

// const Web3 = require('web3');
// const CourierManagerContract = require('./../CourierManager.json');

// const web3 = new Web3('http://localhost:8545');

// let courierManager;
// let accounts;

// async function init() {
//   accounts = await web3.eth.getAccounts();

//   const courierManagerAddress = '0x...'; // Replace with the deployed address of CourierManager
//   courierManager = new web3.eth.Contract(
//     CourierManagerContract.abi,
//     courierManagerAddress
//   );

//   // Add event listeners for buttons
//   document.getElementById('addCourierButton').addEventListener('click', addCourier);
//   document.getElementById('removeCourierButton').addEventListener('click', removeCourier);
//   document.getElementById('viewCouriersButton').addEventListener('click', viewCouriers);
// }

// async function addCourier() {
//   const title = document.getElementById('courierTitle').value;
//   const description = document.getElementById('courierDescription').value;
//   const value = web3.utils.toWei(document.getElementById('courierValue').value, 'ether');
//   const result = await courierManager.methods.addCourier(title, description).send({ from: accounts[0], value });
//   const id = result.events.CourierAdded.returnValues.id;
//   console.log(`Courier added with ID: ${id}`);
// }

// async function removeCourier() {
//   const id = document.getElementById('courierId').value;
//   await courierManager.methods.removeCourier(id).send({ from: accounts[0] });
// }

// async function viewCouriers() {
//   const couriers = await courierManager.methods.getAllCouriers().call();
//   const courierList = document.getElementById('courierList');
//   courierList.innerHTML = '';
//   couriers.forEach((courier) => {
//     const li = document.createElement('li');
//     li.textContent = `ID: ${courier.id}, Title: ${courier.title}, Description: ${courier.description}`;
//     courierList.appendChild(li);
//   });
// }

// init();