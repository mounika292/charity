import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import CharityABI from './artifacts/contracts/Charity.sol/Charity.json';
import { contractAddress } from './config';

function App() {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCharity, setSelectedCharity] = useState(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [isDonating, setIsDonating] = useState(false);
    const [donationStatus, setDonationStatus] = useState(null);
    const [donationHistory, setDonationHistory] = useState([]);

    const charities = [
        { id: 1, name: 'Hope for Education', description: 'Education support for underprivileged children.', trustworthy: true },
        { id: 2, name: 'Food for All', description: 'Food distribution in low-income communities.', trustworthy: true },
        { id: 3, name: 'Animal Welfare Org', description: 'Animal protection and welfare services.', trustworthy: false },
        { id: 4, name: 'Fake Fundraisers', description: 'Unverified charity', trustworthy: false },
        { id: 5, name: 'Clean Water Initiative', description: 'Providing clean and safe drinking water in remote areas.', trustworthy: true },
        { id: 6, name: 'Green Earth Project', description: 'Environmental conservation and reforestation efforts.', trustworthy: true },
        { id: 7, name: 'Health and Hope', description: 'Medical aid for communities lacking healthcare facilities.', trustworthy: true },
        { id: 8, name: 'Children’s Relief Fund', description: 'Aid for children affected by conflict.', trustworthy: false },
        { id: 9, name: 'Global Refugee Support', description: 'Support for displaced families and individuals.', trustworthy: true },
        { id: 10, name: 'Ocean Clean-Up Crew', description: 'Removing plastic and waste from oceans.', trustworthy: true },
        { id: 11, name: 'Housing for All', description: 'Affordable housing for homeless individuals.', trustworthy: true },
        { id: 12, name: 'Education Without Borders', description: 'Promoting education access worldwide.', trustworthy: true },
        { id: 13, name: 'Youth Empowerment Org', description: 'Providing job training for youth.', trustworthy: false },
        { id: 14, name: 'Tech for All', description: 'Technology access for remote regions.', trustworthy: true },
        { id: 15, name: 'Wildlife Rescue Foundation', description: 'Protecting endangered wildlife.', trustworthy: true },
        { id: 16, name: 'Disaster Relief Squad', description: 'Immediate assistance in natural disasters.', trustworthy: true },
        { id: 17, name: 'Senior Citizen Support', description: 'Aid for elderly people in need.', trustworthy: false },
        { id: 18, name: 'Women’s Rights Advocacy', description: 'Empowering women through support and education.', trustworthy: true },
        { id: 19, name: 'Peacekeepers International', description: 'Promoting peace in conflict zones.', trustworthy: false },
        { id: 20, name: 'Local Community Builders', description: 'Building infrastructure in local communities.', trustworthy: true },
        // Add more charities as needed
    ];

    const loadBlockchainData = useCallback(async () => {
        if (window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);

                const charityContract = new web3.eth.Contract(CharityABI.abi, contractAddress);
                setContract(charityContract);
            } catch (error) {
                console.error("Error connecting to blockchain:", error);
            }
        } else {
            console.error("Ethereum provider not found. Please install MetaMask.");
        }
        setLoading(false);
    }, []);

    const donate = async () => {
        if (contract && selectedCharity && donationAmount.trim()) {
            if (!selectedCharity.trustworthy) {
                alert("Warning: The selected charity is not trustworthy. Proceed with caution.");
                return;
            }
            setIsDonating(true);
            setDonationStatus(null);

            try {
                const donationInWei = Web3.utils.toWei(donationAmount, 'ether');

                // Make the donation
                await contract.methods.donate(selectedCharity.id).send({
                    from: account,
                    value: donationInWei,
                    gas: 3000000,
                });

                // Log donation details
                const donationEntry = {
                    charityName: selectedCharity.name,
                    amount: donationAmount,
                    timestamp: new Date().toLocaleString(),
                };
                setDonationHistory((prev) => [...prev, donationEntry]);
                setDonationAmount('');
                setDonationStatus('Donation successful');
            } catch (error) {
                console.error("Donation error:", error);
                setDonationStatus('Donation failed. Please try again.');
            } finally {
                setIsDonating(false);
            }
        } else {
            alert("Please select a charity and enter a valid donation amount.");
        }
    };

    const checkDonationStatus = async () => {
        if (contract && selectedCharity) {
            try {
                const status = await contract.methods.hasReceivedDonation(selectedCharity.id).call();
                setDonationStatus(status ? 'Donation received' : 'No donations received yet');
            } catch (error) {
                console.error("Error checking donation status:", error);
                setDonationStatus('Error checking status');
            }
        } else {
            alert("Please select a charity to check its donation status.");
        }
    };

    useEffect(() => {
        loadBlockchainData();
        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => window.location.reload());
            window.ethereum.on('accountsChanged', (accounts) => setAccount(accounts[0]));
        }
    }, [loadBlockchainData]);

    if (loading) return <div>Loading Blockchain Data...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1>Decentralized Charity Platform</h1>
            <p><strong>Connected Account:</strong> {account || 'Not connected'}</p>

            <DonationForm
                charities={charities}
                selectedCharity={selectedCharity}
                setSelectedCharity={setSelectedCharity}
                donationAmount={donationAmount}
                setDonationAmount={setDonationAmount}
                donate={donate}
                isDonating={isDonating}
                checkDonationStatus={checkDonationStatus}
                donationStatus={donationStatus}
            />

            <DonationHistory donationHistory={donationHistory} />
        </div>
    );
}

function DonationForm({
    charities,
    selectedCharity,
    setSelectedCharity,
    donationAmount,
    setDonationAmount,
    donate,
    isDonating,
    checkDonationStatus,
    donationStatus,
}) {
    return (
        <div>
            <h2>Make a Donation</h2>
            <label>Select a Charity:</label>
            <select
                onChange={(e) => setSelectedCharity(JSON.parse(e.target.value))}
                value={selectedCharity ? JSON.stringify(selectedCharity) : ''}
            >
                <option value="">Select Charity</option>
                {charities.map((charity) => (
                    <option key={charity.id} value={JSON.stringify(charity)}>
                        {charity.name} {charity.trustworthy ? '(Trustworthy)' : '(Not Trustworthy)'}
                    </option>
                ))}
            </select>
            <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Amount in ETH"
            />
            <button onClick={donate} disabled={isDonating}>
                {isDonating ? 'Processing...' : 'Donate Now'}
            </button>
            <button onClick={checkDonationStatus} style={{ marginLeft: '10px' }}>
                Check Donation Status
            </button>

            {donationStatus && (
                <div style={{ marginTop: '10px', color: donationStatus.includes('successful') ? 'green' : 'red' }}>
                    <strong>Status:</strong> {donationStatus}
                </div>
            )}
        </div>
    );
}

function DonationHistory({ donationHistory }) {
    return (
        <div style={{ marginTop: '20px' }}>
            <h2>Your Donation History</h2>
            {donationHistory.length === 0 ? (
                <p>No donations made yet.</p>
            ) : (
                <ul>
                    {donationHistory.map((donation, index) => (
                        <li key={index}>
                            Donated {donation.amount} ETH to {donation.charityName} on {donation.timestamp}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;
