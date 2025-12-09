# Time Capsule

Time Capsule is a decentralized application (dApp) on the Solana blockchain that allows users to create digital time capsules. These capsules can hold messages, promises, or predictions, locked until a specific future date. Upon unlocking, a community voting mechanism determines the resolution of the capsule, which can trigger the release of staked funds to specific destinations.

## 🌟 Features

### Smart Contract
Built with **Rust** and the **Anchor Framework**, the smart contract provides the core logic for the Time Capsule protocol:

-   **Create Capsules:** Users can initialize capsules with:
    -   Metadata URI (stored off-chain, e.g., IPFS/Pinata).
    -   Unlock timestamp.
    -   Voting duration and quorum requirements.
    -   Custom token details (Name/Symbol).
-   **Staking Mechanism:** Users can attach SOL stakes to capsules with programmable destinations:
    -   Return to Creator.
    -   Burn (send to a burn address).
    -   Send to a specific 3rd party address.
-   **Community Governance:**
    -   **Open for Voting:** Once the time lock expires, the capsule enters a voting period.
    -   **Cast Vote:** Community members vote on the validity or outcome of the capsule.
    -   **Resolve:** The capsule is finalized based on the vote outcome (Pass/Fail).
-   **Claim & Management:**
    -   **Claim:** Staked funds are distributed according to the resolution logic.
    -   **Cancel:** Creators can cancel a capsule before the lock period begins.
    -   **Close:** Clean up accounts and reclaim rent after resolution.

### Frontend
A modern, responsive web interface built with **Next.js 16** and **React 19**:

-   **Interactive UI:**
    -   **Parallax Landing Page:** Engaging entry point with `framer-motion` animations.
    -   **Creation Wizard:** Step-by-step process to deploy new capsules effortlessly.
    -   **Dashboard:** View capsule status, countdown timers, and voting progress.
-   **Wallet Integration:** Seamless connection with Solana wallets (Phantom, Solflare, etc.) using `@solana/wallet-adapter`.
-   **Real-time Updates:** Live countdowns and state updates for capsule lifecycles.
-   **Modern Tech Stack:**
    -   **Styling:** Tailwind CSS v4, Radix UI primitives for accessible components.
    -   **Animations:** Smooth transitions and complex animations using Framer Motion.
    -   **Notifications:** Toast notifications via `sonner`.

## 📂 Project Structure

```
.
├── Anchor.toml              # Anchor configuration
├── programs/                # Solana Smart Contract (Rust)
│   └── time-capsule/
│       ├── src/
│       │   ├── instructions/ # Program instructions (Create, Vote, Claim, etc.)
│       │   ├── state.rs      # Account data structures
│       │   └── lib.rs        # Program entry point
├── app/                     # Frontend Application (Next.js)
│   ├── app/                 # Next.js App Router pages
│   │   ├── create/          # Capsule creation flow
│   │   ├── capsules/        # Capsule details and interaction pages
│   │   └── components/      # Shared UI components
│   ├── lib/                 # Utilities and Solana integration
│   └── public/              # Static assets
└── tests/                   # Integration tests (TypeScript)
```

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+ recommended)
-   Rust & Cargo
-   Solana CLI
-   Anchor CLI

### Smart Contract Setup

1.  **Install Dependencies:**
    ```bash
    yarn install
    ```

2.  **Build the Program:**
    ```bash
    anchor build
    ```

3.  **Test the Program:**
    Start a local validator and run tests:
    ```bash
    anchor test
    ```

### Frontend Setup

1.  **Navigate to the App Directory:**
    ```bash
    cd app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Visit `http://localhost:3000` to see the application.

## 📜 Smart Contract Interface

The program ID is defined in `lib.rs`: `BWRB15yyv6d6sbv9sq3GZxs1ptvE49QfZhzVx4n4UycJ`

Key instructions:
-   `initialize_capsule`
-   `add_stake`
-   `open_for_voting`
-   `cast_vote`
-   `resolve_capsule`
-   `claim`
-   `cancel_capsule`
-   `close_capsule`

## 🛠 Technologies

-   **Blockchain:** Solana, Anchor
-   **Frontend:** Next.js, React, TypeScript, Tailwind CSS
-   **Libraries:** Framer Motion, Lucide React, Solana Web3.js

