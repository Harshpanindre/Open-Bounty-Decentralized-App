# OpenBounty

OpenBounty is a decentralized bounty management application (DApp) built
around Ethereum smart contracts. It lets users publish tasks with ETH
rewards, submit completed work, and approve submissions so the bounty
reward can be released through the smart contract.

The frontend is built with HTML, CSS, and JavaScript. It connects to an
Ethereum wallet through MetaMask and interacts with the contract using
ethers.js.

## Features

-   **Connect a wallet:** Connect MetaMask and display the connected
    wallet address.
-   **Create and fund bounties:** Publish a task description and attach
    an ETH reward.
-   **Browse open bounties:** View bounty descriptions, reward amounts,
    issuer addresses, and status.
-   **Submit work:** Submit a URL to completed work for an open bounty.
-   **Review submissions:** The bounty issuer can view the submitted
    work and approve it.
-   **Smart-contract-based workflow:** Bounty creation, submissions, and
    approvals are sent as blockchain transactions.
-   **Transaction feedback:** Loading indicators and success/error
    messages help communicate transaction progress.
-   **Responsive interface:** A dark-themed layout adapts for narrower
    and wider screens.

## How It Works

1.  A user opens OpenBounty and connects MetaMask.
2.  The app reads bounty records from the configured smart contract.
3.  An issuer enters a task description and reward amount in ETH, then
    creates and funds the bounty.
4.  Another user submits a URL containing their completed work.
5.  The issuer reviews the submission and approves it.
6.  The smart contract handles the approval and reward-release logic.

Bounties are shown with these states:

-   **Open** --- work can be submitted.
-   **Awaiting Approval** --- a submission has been made and is waiting
    for the issuer.
-   **Closed** --- the work has been approved and the bounty is marked
    completed.

## Tech Stack

-   **HTML5** --- page structure
-   **CSS3** --- styling and responsive layout
-   **JavaScript** --- frontend behavior and contract interaction
-   **Ethereum smart contract** --- bounty state and transaction logic
-   **ethers.js v5.7** --- Ethereum provider and contract interaction
-   **MetaMask** --- wallet connection and transaction signing

## Project Structure

``` text
OpenBounty/
├── index.html    # Main application page
├── style.css     # Application styling
├── app.js        # Wallet and smart-contract interaction
└── ether.js      # ethers.js library file (if retained in the repository)
```

> The HTML currently loads ethers.js from a CDN. If `ether.js` is a
> local copy of the library, it may not be required by the page as
> currently configured.

## Requirements

Before running the application, make sure you have:

-   A modern browser
-   [MetaMask](https://metamask.io/) installed
-   Access to the Ethereum network or test network where your bounty
    contract is deployed
-   The correct deployed smart-contract address and compatible contract
    ABI

## Setup and Run

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

Replace the placeholders with your GitHub repository URL and folder
name.

### 2. Configure the smart-contract address

Open `app.js` and locate the configuration near the top:

``` javascript
const contractAddress = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";
```

Replace this value with the address of **your deployed bounty contract**
on the network you intend to use. The address currently in the source
code should be treated as a configuration value, not proof that the
contract is deployed on a public network.

The application also includes a contract ABI in `app.js`. Make sure it
matches the deployed contract and supports the functions and events used
by the frontend.

### 3. Open the application

Because this is a static frontend, you can serve the project using a
local development server. For example, with the VS Code Live Server
extension, open `index.html` using **Open with Live Server**.

Alternatively, use Python if it is installed:

``` bash
python -m http.server 8000
```

Then visit:

``` text
http://localhost:8000
```

### 4. Connect MetaMask

-   Unlock MetaMask.
-   Switch to the network where the bounty contract is deployed.
-   Open the application and select **Connect Wallet**.
-   Approve the connection request.

You will need the network's native currency to pay gas fees. Creating a
bounty also requires the ETH reward specified in the form.

## Smart-Contract Interface

The frontend expects the configured contract to expose the following
functions:

  -----------------------------------------------------------------------
  Function                            Purpose
  ----------------------------------- -----------------------------------
  `bountyCount()`                     Returns the number of bounties

  `bounties(uint256)`                 Reads a bounty's stored information

  `createBounty(string)`              Creates a bounty; the frontend
                                      sends the reward as transaction
                                      value

  `submitWork(uint256, string)`       Submits a work URL for a bounty

  `approveWork(uint256)`              Approves a submission and triggers
                                      the contract's reward-release logic
  -----------------------------------------------------------------------

The frontend listens for these contract events to refresh the bounty
list:

-   `BountyCreated`
-   `BountySubmitted`
-   `BountyApproved`

The smart-contract source code and deployment instructions are not
included in the provided frontend files. Deploy or obtain the matching
contract separately before using the app.

## Configuration Notes

-   The contract address is configured in `app.js`.
-   The ABI in `app.js` must match the deployed contract.
-   The app uses ethers.js **5.7** through a CDN; changing to a
    different major version may require code changes.
-   Submission URLs are links to externally hosted work. The application
    does not upload the work itself.
-   The app depends on MetaMask's injected `window.ethereum` provider.

## Security and Usage Notes

-   Use a test network and test funds while developing.
-   Verify the contract address and network before signing transactions.
-   Review the smart contract before sending real funds. The frontend
    alone cannot guarantee the contract's security or correctness.
-   Never share your wallet's seed phrase or private key.
-   Treat submitted URLs as untrusted external content and open them
    carefully.
-   This repository contains frontend code; do not assume the smart
    contract has been audited or that the application is
    production-ready.

## Troubleshooting

**MetaMask is not detected** - Install or enable MetaMask in your
browser. - Reload the page after enabling the extension.

**The bounty list fails to load** - Confirm MetaMask is connected to the
correct network. - Verify that `contractAddress` points to a deployed
contract. - Check that the contract ABI matches the deployed contract. -
Open the browser developer console to inspect errors.

**A transaction fails** - Check that your wallet has enough native
currency for gas. - For bounty creation, ensure the wallet can cover
both the bounty reward and gas fees. - Confirm that the bounty is in the
correct state and that the connected account is authorized to perform
the requested action.

## Future Improvements

Potential next steps for the project include:

-   Add automated tests for the smart contract and frontend
    interactions.
-   Add filtering and sorting for open, pending, and completed bounties.
-   Display transaction hashes and links to a block explorer.
-   Improve form validation and user-facing transaction status.
-   Add deployment instructions and network-specific configuration.
-   Add automated deployment and verification for the smart contract.

## Contributing

Contributions and suggestions are welcome. For substantial changes, open
an issue first to discuss the proposed improvement.

## License

No license has been specified yet. Add a `LICENSE` file before
presenting this repository as open source, and choose a license that
matches your intended use.
