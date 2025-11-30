# TimeCapsule — Product Requirements Document (PRD)

## 1. Overview
TimeCapsule is a Solana-based social dapp that allows users to create time-locked “capsules” that open on a future date. Each capsule contains a statement, prediction, goal, or commitment. Capsules are represented as NFTs and include optional accountability stakes. When the capsule opens, the community votes to determine whether the outcome is successful or not. Stakes are resolved based on the result.

The experience is fun, social, non-gambling, and designed to showcase Solana’s strengths: low fees, fast confirmation, NFTs, PDAs, and on-chain state.

---

## 2. Core Objectives
- Provide a unique, original on-chain experience combining social expression and accountability.
- Demonstrate real Solana use cases (PDAs, NFTs, state transitions, voting).
- Deliver a polished UX suitable for a public demo, trailer, and Indie.fun fundraising.
- Ship an MVP within ~2 weeks with clear future expansion paths.

---

## 3. User Personas

### 3.1 Regular User
- Creates personal or public capsules.
- Stakes optional tokens as motivation.
- Votes on opened capsules.
- Shares capsules on social media.
- Views profile and capsule history.

### 3.2 Capsule Creator
- Might set a personal goal (“lose weight”, “ship an app”).
- Might make fun predictions (“WIF reaches rank 30”).
- Uses the app for social accountability.
- Can transfer capsule NFT before open date.

### 3.3 Voters
- Participate in resolution phase once capsule opens.
- Vote Yes/No based on truthfulness.
- Can receive distributed stake if capsule fails (if the creator chooses).

---

## 4. Key Features

### 4.1 Capsule Creation
- Fill form with title, description, category, optional image.
- Choose open date (future timestamp).
- Optional accountability stake.
- Select stake destination on failure:
  - Community pool
  - Charity address
  - Top voters (reward)
- Upload metadata to IPFS/Arweave.
- Program call: `initialize_capsule`.

### 4.2 Capsule NFT
- Minted on creation.
- Represents ownership of the capsule.
- Transferable to other users.

### 4.3 Time-Lock + Opening
- Capsule remains locked until `open_timestamp`.
- Anyone can trigger `open_for_voting` after timestamp.

### 4.4 Voting
- Users vote Yes/No.
- One vote per wallet (enforced by PDA).
- Votes stored on-chain.
- Tally updated in capsule PDA.

### 4.5 Resolution
- After a voting period (e.g., 48 hours), anyone can call `resolve_capsule`.
- Conditions:
  - Quorum reached (min votes).
  - Majority wins: Yes → success; No → failure.
- Stake resolution:
  - Success → stake returned to creator.
  - Failure → stake distributed to chosen destination.

### 4.6 Rewards + Withdrawals
- Stake payout logic executed via escrow PDA.
- Creator or destination calls `claim` instruction.

### 4.7 Feed + Discovery
- List of capsules:
  - Active
  - Opening soon
  - Open for voting
  - Resolved
- Filters by category.

### 4.8 Capsule Detail Page
- Shows:
  - Title, description, metadata
  - Owner & creator
  - NFT link
  - Timer until open
  - Voting UI (when open)
  - Stake information
  - Resolution details

### 4.9 Profile Page
- Capsules created
- Capsules owned
- Voted capsules
- Reputation score (optional v2)

---

## 5. Functional Requirements

### 5.1 Smart Contract Requirements

#### PDA Layouts
1. **Capsule PDA**  
   Stores capsule metadata, state, stake info, vote tallies.

2. **Escrow PDA**  
   Holds the stake (lamports or SPL token).

3. **Voter PDA**  
   One per capsule per user to prevent double voting.

4. **NFT Mint**  
   Represents capsule ownership.

#### Instructions
1. `initialize_capsule`
2. `open_for_voting`
3. `cast_vote`
4. `resolve_capsule`
5. `claim`
6. `cancel_capsule` (optional)
7. `submit_evidence` (optional)

#### State Machine
- `Active`
- `OpenForVoting`
- `Resolved`
- `Cancelled`

#### Stake Rules
- Must be optional.
- No randomness.
- Always user-selected destination.

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Sub-second UI responsiveness.
- Backend-free architecture (except IPFS upload).

### 6.2 Security
- No RNG.
- Prevent double voting.
- Quorum enforcement.
- Escrow correctness.

### 6.3 Regulatory Compliance
- No gambling mechanics.
- Stakes framed as accountability bonds.
- No chance-based outcomes.

### 6.4 UX Quality
- Clean, modern UI.
- Mobile responsive.
- Clear state transitions.

---

## 7. Technical Architecture

### 7.1 Frontend (Next.js 15)
- App Router.
- Solana Wallet Adapter.
- Anchor client.
- IPFS upload via web3.storage.
- UI Components:
  - CapsuleCard
  - CreateCapsuleForm
  - VotePanel
  - CountdownTimer
  - NFTViewer

### 7.2 Program (Anchor)
- Single program with ~8 instructions.
- Unit tests for all flows.
- Events emitted for indexing.

### 7.3 Storage
- On-chain:
  - Capsule PDA
  - Vote PDAs
- Off-chain:
  - Metadata JSON
  - Images
  - Evidence hash (optional)

### 7.4 Deployment
- Program deployed to devnet.
- Frontend hosted on Vercel.
- Metadata pinned to IPFS.

---

## 8. API / Instruction Definitions

### 8.1 initialize_capsule
Inputs:
- metadata_uri
- open_timestamp
- stake_amount
- stake_mint
- stake_destination
- quorum

Outputs:
- Capsule PDA
- Escrow PDA
- NFT Mint

### 8.2 open_for_voting
- Validates timestamp
- Sets capsule.status = OpenForVoting

### 8.3 cast_vote
- Creates voter PDA
- Updates tally

### 8.4 resolve_capsule
- Checks quorum
- Determines result
- Moves stake accordingly
- Sets status = Resolved

### 8.5 claim
- Allows creator or destination to withdraw from escrow

---

## 9. UX Flow Diagrams (Text)

### 9.1 Create Capsule
User → Upload metadata → Choose date → Optional stake → Sign tx → Capsule created → NFT minted → Redirect to capsule page.

### 9.2 Voting Flow
User → Capsule open → Cast vote → PDA created → UI updates live tallies.

### 9.3 Resolution
Anyone → Triggers `resolve_capsule` → Stake distributed → Result displayed.

---

## 10. Milestones & Timeline (14 Days)

### Day 1–5: Smart Contract
- PDAs
- Create capsule
- NFT minting
- Escrow
- Voting
- Resolution
- Tests
- Devnet deploy

### Day 6–11: Frontend
- Create capsule UI
- Feed + detail page
- Voting UI
- Resolution UI
- Profile page
- Final design polish

### Day 12–14: Trailer & Submission
- Demo capsules
- Trailer recording
- Indie.fun page creation
- GitHub README
- Final deployment

---

## 11. Risks & Mitigation

### Risk: Low voter participation  
Mitigation: Low quorum + optional promotion tools.

### Risk: Misinterpretation as gambling  
Mitigation: Optional stakes, clear wording, no RNG.

### Risk: Time constraints  
Mitigation: Strict MVP scope with expandable architecture.

---

## 12. Future Improvements (Post-Hackathon)
- Reputation system
- Compressed NFTs
- Social verification tools
- Capsule trading marketplace
- AI-generated summaries on capsule open
- Group capsules / team commitments
- Public timelines
- Notifications

---

## 13. Success Criteria

### Functional
- Full create → open → vote → resolve loop works on devnet.
- UI polished and mobile responsive.
- NFT ownership functioning.

### UX
- Trailer appealing.
- Judges can navigate easily.

### Technical
- Clean Anchor codebase.
- Comprehensive tests.
- Stable devnet deployment.

---

# End of PRD
