// --- 1. CONFIGURATION ---

// !!! IMPORTANT !!!
// PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
const contractAddress = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";

// Contract ABI (Application Binary Interface)
const contractABI = [
    "event BountyApproved(uint256 id, address submitter, uint256 reward)",
    "event BountyCreated(uint256 id, address issuer, uint256 reward)",
    "event BountySubmitted(uint256 id, address submitter, string submissionUrl)",
    "function approveWork(uint256 _bountyId) public",
    "function bountyCount() public view returns (uint256)",
    "function bounties(uint256) public view returns (uint256 id, address issuer, uint256 reward, string taskDescription, address submitter, string submissionUrl, uint8 currentState)",
    "function createBounty(string memory _taskDescription) public payable",
    "function submitWork(uint256 _bountyId, string memory _submissionUrl) public"
];

// --- 2. GLOBAL VARIABLES ---
let provider;
let signer;
let contract;
let userAddress;

// Enum state mapping (matches Solidity)
const STATE_MAP = {
    0: "Open",
    1: "Awaiting Approval",
    2: "Closed"
};

// --- 3. DOM ELEMENTS ---
const connectButton = document.getElementById('connectButton');
const walletAddress = document.getElementById('walletAddress');
const bountyList = document.getElementById('bountyList');
const loadingBounties = document.getElementById('loadingBounties');
const createBountyForm = document.getElementById('createBountyForm');
const submissionModal = document.getElementById('submissionModal');
const submissionForm = document.getElementById('submissionForm');
const cancelSubmit = document.getElementById('cancelSubmit');
const modalBountyId = document.getElementById('modalBountyId');
const loadingOverlay = document.getElementById('loadingOverlay');

// --- 4. CORE FUNCTIONS ---

/**
 * Connects to MetaMask and initializes the application
 */
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        return alert('MetaMask is not installed!');
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Update UI
        connectButton.textContent = "Connected";
        walletAddress.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;

        // Load bounties and set up event listeners
        await loadBounties();
        setupEventListeners();

    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet.");
    }
}

/**
 * Fetches all bounties from the contract and renders them
 */
async function loadBounties() {
    if (!contract) return;
    
    try {
        bountyList.innerHTML = ''; // Clear existing list
        const count = (await contract.bountyCount()).toNumber();

        if (count === 0) {
            bountyList.innerHTML = '<p>No bounties found. Be the first to create one!</p>';
            return;
        }

        // Loop from the most recent bounty (ID) down to 1
        for (let i = count; i > 0; i--) {
            const bounty = await contract.bounties(i);
            renderBountyCard(bounty);
        }
    } catch (error) {
        console.error("Error loading bounties:", error);
        bountyList.innerHTML = '<p style="color: red;">Error loading bounties. Is your contract address correct?</p>';
    }
}

/**
 * Creates the HTML for a single bounty card and appends it to the list
 */
function renderBountyCard(bounty) {
    const card = document.createElement('div');
    card.className = "bounty-card";
    
    const state = STATE_MAP[bounty.currentState];
    const rewardInEth = ethers.utils.formatEther(bounty.reward);

    let buttons = '';
    let stateClass = '';
    
    // Logic for which button to show and status tag color
    if (bounty.currentState === 0) { // Open
        stateClass = 'status-open';
        buttons = `<button class="btn btn-blue submitWorkBtn" data-id="${bounty.id}">Submit Work</button>`;
    } else if (bounty.currentState === 1) { // Awaiting Approval
        stateClass = 'status-approval';
        let submissionLink = `<a href="${ethers.utils.escapeHtml(bounty.submissionUrl)}" target="_blank" rel="noopener noreferrer">View Submission</a>`;
        
        if (bounty.issuer.toLowerCase() === userAddress.toLowerCase()) {
            buttons = `<button class="btn btn-green approveWorkBtn" data-id="${bounty.id}">Approve Work</button> ${submissionLink}`;
        } else {
            buttons = submissionLink;
        }
    } else { // Closed
        stateClass = 'status-closed';
        buttons = `<span class="status-closed" style="padding: 0.5rem 0;">Completed & Paid</span>`;
    }

    card.innerHTML = `
        <div class="card-header">
            <h3>Bounty #${bounty.id}</h3>
            <span class="status-tag ${stateClass}">${state}</span>
        </div>
        <p>${ethers.utils.escapeHtml(bounty.taskDescription)}</p>
        <div class="card-divider"></div>
        <div class="card-info">
            <span>Reward</span>
            <span class="reward">${rewardInEth} ETH</span>
        </div>
        <div class="card-info">
            <span>Issuer</span>
            <span class="address">${bounty.issuer.substring(0, 6)}...${bounty.issuer.substring(bounty.issuer.length - 4)}</span>
        </div>
        ${bounty.currentState !== 0 ? `
        <div class="card-info">
            <span>Submitter</span>
            <span class="address">${bounty.submitter.substring(0, 6)}...${bounty.submitter.substring(bounty.submitter.length - 4)}</span>
        </div>` : ''}
        <div class="card-actions">
            ${buttons}
        </div>
    `;
    bountyList.appendChild(card);
}

/**
 * Shows the loading overlay
 */
function showLoading(show) {
    loadingOverlay.classList.toggle('hidden', !show);
}

// --- 5. EVENT HANDLERS ---

/**
 * Handles the "Create Bounty" form submission
 */
async function handleCreateBounty(e) {
    e.preventDefault();
    if (!contract) return alert("Please connect your wallet first.");

    const description = document.getElementById('taskDescription').value;
    const amount = document.getElementById('rewardAmount').value;

    if (!description || !amount) {
        return alert("Please fill out all fields.");
    }

    try {
        const rewardInWei = ethers.utils.parseEther(amount);
        
        showLoading(true);
        const tx = await contract.createBounty(description, { value: rewardInWei });
        await tx.wait();
        
        showLoading(false);
        alert("Bounty created successfully!");
        createBountyForm.reset();
        await loadBounties(); // Refresh the list
        
    } catch (error) {
        showLoading(false);
        console.error("Error creating bounty:", error);
        alert(`Error: ${error.data?.message || error.message}`);
    }
}

/**
 * Handles the "Submit Work" modal form submission
 */
async function handleSubmitWork(e) {
    e.preventDefault();
    const bountyId = modalBountyId.textContent;
    const url = document.getElementById('submissionUrl').value;

    if (!url) return alert("Please provide a submission URL.");

    try {
        showLoading(true);
        const tx = await contract.submitWork(bountyId, url);
        await tx.wait();
        
        showLoading(false);
        alert("Work submitted successfully!");
        submissionModal.classList.add('hidden');
        submissionForm.reset();
        await loadBounties(); // Refresh the list

    } catch (error) {
        showLoading(false);
        console.error("Error submitting work:", error);
        alert(`Error: ${error.data?.message || error.message}`);
    }
}

/**
 * Handles clicks on the dynamic bounty list
 */
function handleBountyListClick(e) {
    // Handle "Submit Work" button click
    if (e.target.classList.contains('submitWorkBtn')) {
        const bountyId = e.target.dataset.id;
        modalBountyId.textContent = bountyId;
        submissionModal.classList.remove('hidden');
    }

    // Handle "Approve Work" button click
    if (e.target.classList.contains('approveWorkBtn')) {
        if (!confirm("Are you sure you want to approve this work and release the funds?")) {
            return;
        }
        const bountyId = e.target.dataset.id;
        handleApproveWork(bountyId);
    }
}

/**
 * Handles the "Approve Work" transaction
 */
async function handleApproveWork(bountyId) {
    try {
        showLoading(true);
        const tx = await contract.approveWork(bountyId);
        await tx.wait();
        
        showLoading(false);
        alert("Work approved and funds released!");
        await loadBounties(); // Refresh the list

    } catch (error) {
        showLoading(false);
        console.error("Error approving work:", error);
        alert(`Error: ${error.data?.message || error.message}`);
    }
}

/**
 * Sets up all necessary event listeners
 */
function setupEventListeners() {
    connectButton.onclick = connectWallet;
    createBountyForm.onsubmit = handleCreateBounty;
    
    // Modal controls
    submissionForm.onsubmit = handleSubmitWork;
    cancelSubmit.onclick = () => submissionModal.classList.add('hidden');
    
    // Event delegation for dynamic buttons in the list
    bountyList.addEventListener('click', handleBountyListClick);

    // Listen for contract events to auto-refresh
    if (contract) {
        contract.on("BountyCreated", (id, issuer, reward) => {
            console.log("Event: BountyCreated", id, issuer);
            loadBounties();
        });
        contract.on("BountySubmitted", (id, submitter, url) => {
            console.log("Event: BountySubmitted", id, submitter);
            loadBounties();
        });
        contract.on("BountyApproved", (id, submitter, reward) => {
            console.log("Event: BountyApproved", id, submitter);
            loadBounties();
        });
    }

    // Also listen for account changes in MetaMask
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                connectWallet(); // Re-connect with new account
            } else {
                // User disconnected
                connectButton.textContent = "Connect Wallet";
                walletAddress.textContent = "Not Connected";
                contract = null;
                userAddress = null;
                bountyList.innerHTML = '<p>Connect your wallet to see bounties.</p>';
            }
        });
    }
}

// --- 6. INITIALIZATION ---
// This runs when the script file is loaded
(async () => {
    // Automatically try to connect if wallet is already permitted
    if (window.ethereum && (await window.ethereum.request({ method: 'eth_accounts' })).length > 0) {
        await connectWallet();
    } else {
        bountyList.innerHTML = '<p>Connect your wallet to see bounties.</p>';
        connectButton.onclick = connectWallet;
    }

    // Set up listeners that don't depend on wallet connection
    submissionForm.onsubmit = handleSubmitWork;
    cancelSubmit.onclick = () => submissionModal.classList.add('hidden');
    createBountyForm.onsubmit = handleCreateBounty;
    bountyList.addEventListener('click', handleBountyListClick);
})();
