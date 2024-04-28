// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;
// pragma experimental ABIEncoderV2;

contract CourierManager {
    // struct Courier {
    //     string title;
    //     string description;
    //     uint256 id;
    //     address owner;
    // }

    // mapping(uint256 => Courier) public couriers;
    // uint256 public courierCount;
    address[100] public owners;
    string[100] public titles;
    string[100] public descriptions;


    event CourierAdded(uint256 id, string title, string description, address courier);
    event CourierRemoved(uint256 id);

    function addCourier(string memory _title, string memory _description) public payable returns (uint256) {
        require(msg.value > 0, "You must send some ETH to add a courier.");
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == address(0)) {
                owners[i] = msg.sender;
                titles[i] = _title;
                descriptions[i] = _description;
                emit CourierAdded(i, _title, _description, msg.sender);
                return i;
            }
        }
    }

    function removeCourier(uint256 _id) public {
        require(owners[_id] == msg.sender, "You must be the owner of the courier to remove it.");
        owners[_id] = address(0);
        emit CourierRemoved(_id);
    }

    // function getAllCouriers() public view returns (address[100] memory, string[100] memory, string[100] memory) {
    //     return (owners, titles, descriptions);
    // }

    function getAddresses() public view returns (address[100] memory) {
        return owners;
    }

    function getAdress(uint256 _id) public view returns (address) {
        return owners[_id];
    }

    function getTitle(uint256 _id) public view returns (string memory) {
        return titles[_id];
    }

    function getDescription(uint256 _id) public view returns (string memory) {
        return descriptions[_id];
    }

    function getCourier(uint256 _id) public view returns (address, string memory, string memory) {
        return (owners[_id], titles[_id], descriptions[_id]);
    }
}