# Solana Mint, PDA, and ATA Architecture

## 1. High-Level Overview

This document explains how Solana mint accounts, PDAs, token accounts, and the SPL Token/ATA programs interact.

---

## 2. Visual Architecture Diagram

```
                       ┌───────────────────────────┐
                       │  Your On-Chain Program     │
                       │  (owns PDA mint authority) │
                       └───────────────┬───────────┘
                                       │ signs (PDA seeds)
                                       ▼
                     ┌────────────────────────────────────┐
                     │ SPL Token Program (infrastructure) │
                     │ - Owns Mints and Token Accounts    │
                     │ - Only program allowed to mutate   │
                     └─────────────┬───────────────┬─────┘
                                   │               │
                                   │ CPI           │ CPI
                                   ▼               ▼
            ┌────────────────────────────┐   ┌───────────────────────────┐
            │ Mint Account (Currency)     │   │ ATA (User Token Account) │
            │ - Owned by SPL Token Prog   │   │ - Owned by SPL Token Prog│
            │ - supply, authorities       │   │ - balance, owner, mint   │
            └────────────────────────────┘   └───────────────────────────┘
```

---

## 3. Concept Mapping to Web2 Banking

| Solana Component         | Banking Analogy                                  |
| ------------------------ | ------------------------------------------------ |
| Mint Account             | Central bank (defines currency, can print money) |
| Mint Authority (PDA)     | Central bank's issuance authority                |
| Associated Token Account | User's personal bank account                     |
| User Pubkey              | Bank account holder's identity                   |
| SPL Token Program        | Banking ledger infrastructure                    |
| ATA Program              | Automated bank account creator                   |
| Your Program (PDA)       | Policy engine for minting and burning decisions  |

---

## 4. Detailed Component Explanation

### 4.1 Mint Account

Represents the currency itself.  
Owned by the SPL Token Program.  
Stores:

- `decimals`
- `total supply`
- `mint authority`
- `freeze authority`

**Important:** A Mint does **not** store balances.

---

### 4.2 Associated Token Account (ATA)

Represents an individual user's balance for a specific mint.  
Owned by SPL Token Program.

**Stores:**

- `amount`
- `owner` (user pubkey)
- `mint`

**Deterministically derived from:**

```rust
ATA = find_address(user_pubkey, mint_pubkey)
```

---

### 4.3 Your On-Chain Program & PDA Authority

Your program:

- cannot mutate mint or token account data directly
- uses a PDA as mint authority
- signs using seeds
- calls SPL Token Program via CPI to perform all mutations

---

### 4.4 SPL Token Program

The SPL Token Program is the **only** program allowed to mutate:

- mint data
- token account balances

Your program requests operations; the SPL Token Program performs them.

---

### 4.5 ATA Program

Handles creation of ATAs:

- computes the ATA PDA
- initializes the token account owned by SPL Token Program
- calls SPL Token Program via CPI to finalize initialization

---

## 5. System Flow Example (Minting Tokens)

```
(1) Your Program receives instruction
│
▼
(2) PDA is derived (mint authority)
│
▼
(3) Program issues CPI → SPL Token Program:
    - MintTo
    - Burn
    - Freeze
    │
    ▼
    (4) SPL Token Program checks:
    - mint authority
    - PDA signature
    │
    ▼
    (5) SPL Token Program updates state:
    - Mint supply
    - User ATA balance
```

**Summary:** Your program orchestrates. SPL Token Program executes and mutates.

---

## 6. Banking Analogy (Final Version)

### Central Bank = Mint Account

Defines currency; can mint/burn.

### Central Bank Authority = PDA Mint Authority

Controlled by your program.

### User Bank Account = ATA

Stores user's balance.

### Ledger Infrastructure = SPL Token Program

The only entity that updates balances.

### Your Protocol = Your Program

Business logic controlling mint events.

---

## 7. Combined Architecture Diagram

```
                     Your Program
           (policy logic / business rules)
                             │
                             │ derives PDA (mint authority)
                             ▼
                     PDA Signs via Seeds
                             │
                             ▼
                 SPL Token Program (owner)
           /                              \
          / CPI                        CPI \
         ▼                                ▼

    Mint Account                    User ATA Account
    (central bank)                  (user's balance)
    • supply                        • amount
    • mint_authority = PDA          • owner = user pubkey
    • freeze_authority = PDA        • mint = mint pubkey
```

---

## 8. Summary

- **Mint accounts** define the currency.
- **ATAs** store user balances.
- **PDA** authorizes actions, but SPL Token Program performs mutations.
- All state changes happen through **CPI** (Cross-Program Invocation).
