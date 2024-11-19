// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Charity {
    struct CharityInfo {
        uint256 id;
        string name;
        string description;
        uint256 totalDonations;
    }

    mapping(uint256 => CharityInfo) public charities;
    uint256 public charityCount;

    // Track donations by user and charity
    mapping(address => mapping(uint256 => uint256)) public userDonations;

    // Track confirmation of donations by charity
    mapping(uint256 => mapping(address => bool)) public donationConfirmations;

    address public owner;

    event CharityAdded(uint256 id, string name, string description);
    event DonationReceived(uint256 id, string name, uint256 amount, address donor);
    event FundsWithdrawn(uint256 amount, address to);
    event DonationConfirmed(uint256 charityId, address donor, bool confirmed);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can withdraw funds.");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Initialize with a few charities
        addCharity("Hope for Education", "Supporting educational initiatives for underprivileged children.");
        addCharity("Green Earth Initiative", "Environmental conservation and sustainable projects.");
        addCharity("Health for All", "Providing healthcare to underserved communities.");
    }

    // Function to add a new charity by the contract owner
    function addCharity(string memory _name, string memory _description) public onlyOwner {
        charityCount++;
        charities[charityCount] = CharityInfo(charityCount, _name, _description, 0);
        emit CharityAdded(charityCount, _name, _description);
    }

    // Donation function to donate to a specific charity
    function donate(uint256 charityId) public payable {
        require(charityId > 0 && charityId <= charityCount, "Charity does not exist.");
        require(msg.value > 0, "Donation amount must be greater than zero.");

        CharityInfo storage charity = charities[charityId];
        charity.totalDonations += msg.value;
        userDonations[msg.sender][charityId] += msg.value;  // Track donation per user

        emit DonationReceived(charityId, charity.name, msg.value, msg.sender);
    }

    // Function to allow a charity to confirm receipt of a donation
    function confirmDonation(uint256 charityId, address donor) public {
        require(charityId > 0 && charityId <= charityCount, "Charity does not exist.");
        
        // For demonstration purposes, we'll allow anyone to confirm the donation.
        // Ideally, only authorized charity representatives should confirm
        donationConfirmations[charityId][donor] = true;
        emit DonationConfirmed(charityId, donor, true);
    }

    // Function to retrieve charity information
    function getCharity(uint256 charityId) public view returns (uint256, string memory, string memory, uint256) {
        CharityInfo memory charity = charities[charityId];
        return (charity.id, charity.name, charity.description, charity.totalDonations);
    }

    // Function to check the total donation amount made by a user to a specific charity
    function getUserDonationToCharity(address user, uint256 charityId) public view returns (uint256) {
        return userDonations[user][charityId];
    }

    // Function to check if the charity has confirmed the donation from a particular donor
    function isDonationConfirmed(uint256 charityId, address donor) public view returns (bool) {
        return donationConfirmations[charityId][donor];
    }

    // Withdraw funds by contract owner
    function withdraw(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient funds in the contract.");
        
        payable(owner).transfer(amount);
        emit FundsWithdrawn(amount, owner);
    }

    // Fallback function to receive Ether directly
    receive() external payable {}
}
