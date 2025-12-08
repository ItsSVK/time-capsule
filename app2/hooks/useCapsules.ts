'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { BN, Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { useProgram } from './useProgram';
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from '@/lib/solana/constants';
import {
  CapsuleAccount,
  CapsuleMetadata,
  ParsedCapsule,
  getCapsuleStatus,
  getCapsuleResult,
  getStakeDestination,
  CapsuleStatus,
  StakeDestination,
} from '@/lib/solana/types';
import { fetchMetadata } from '@/lib/pinata';
import idl from '@/lib/solana/idl.json';

export function useCapsules() {
  const { connection } = useConnection();
  const { program: walletProgram, wallet } = useProgram();
  const [capsules, setCapsules] = useState<ParsedCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a read-only program for fetching data when wallet is not connected
  const readOnlyProgram = useMemo(() => {
    if (walletProgram) return walletProgram; // Use wallet program if available

    // Create a read-only provider with a dummy keypair
    const dummyKeypair = Keypair.generate();
    const readOnlyProvider = new AnchorProvider(
      connection,
      {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx: Transaction | VersionedTransaction) => tx,
        signAllTransactions: async (
          txs: (Transaction | VersionedTransaction)[]
        ) => txs,
      } as never,
      AnchorProvider.defaultOptions()
    );

    return new Program(idl as Idl, readOnlyProvider);
  }, [walletProgram, connection]);

  const fetchCapsules = useCallback(
    async (isRefetch = false) => {
      if (!readOnlyProgram) {
        // Program still initializing, keep loading
        return;
      }

      try {
        // Only set loading to true on initial fetch, not on refetch
        if (isRefetch) {
          setRefetching(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Fetch all capsule accounts
        const accounts = await (
          readOnlyProgram.account as Record<
            string,
            {
              all: () => Promise<
                { publicKey: PublicKey; account: CapsuleAccount }[]
              >;
            }
          >
        ).capsule.all();
        const now = Math.floor(Date.now() / 1000);

        // Parse capsules with metadata
        const parsedCapsules = await Promise.all(
          accounts.map(
            async ({
              publicKey,
              account,
            }: {
              publicKey: PublicKey;
              account: CapsuleAccount;
            }) => {
              // Fetch metadata from IPFS
              const metadata = await fetchMetadata<CapsuleMetadata>(
                account.metadataUri
              );

              const status = getCapsuleStatus(account);
              const result = getCapsuleResult(account);
              const stakeDestination = getStakeDestination(account);
              const openTimestamp = account.openTimestamp.toNumber();
              const votingEndTimestamp = account.votingEndTimestamp.toNumber();
              const totalVotes =
                account.yesVotes.toNumber() + account.noVotes.toNumber();
              const yesPercentage =
                totalVotes > 0
                  ? (account.yesVotes.toNumber() / totalVotes) * 100
                  : 50;

              return {
                publicKey,
                account,
                metadata,
                status,
                result,
                stakeDestination,
                timeRemaining: Math.max(0, openTimestamp - now),
                votingTimeRemaining: Math.max(0, votingEndTimestamp - now),
                totalVotes,
                yesPercentage,
              } as ParsedCapsule;
            }
          )
        );

        // Sort by open timestamp (newest first)
        parsedCapsules.sort(
          (a, b) =>
            b.account.openTimestamp.toNumber() -
            a.account.openTimestamp.toNumber()
        );

        setCapsules(parsedCapsules);
      } catch (err) {
        console.error('Error fetching capsules:', err);
        setError('Failed to fetch capsules');
      } finally {
        setLoading(false);
        setRefetching(false);
      }
    },
    [readOnlyProgram]
  );

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  // Get user's created capsules
  const userCapsules = capsules.filter(
    c => wallet.publicKey && c.account.creator.equals(wallet.publicKey)
  );

  // Get capsules by status
  const activeCapsules = capsules.filter(
    c => c.status === CapsuleStatus.Active
  );
  const votingCapsules = capsules.filter(
    c => c.status === CapsuleStatus.OpenForVoting
  );
  const resolvedCapsules = capsules.filter(
    c => c.status === CapsuleStatus.Resolved
  );

  return {
    capsules,
    userCapsules,
    activeCapsules,
    votingCapsules,
    resolvedCapsules,
    loading,
    refetching,
    error,
    refetch: () => fetchCapsules(true),
  };
}

export function useCapsuleActions() {
  const { program, wallet, connection } = useProgram();

  const createCapsule = useCallback(
    async (
      metadataUri: string,
      openTimestamp: number,
      votingDuration: number,
      quorum: number,
      name: string,
      symbol: string
    ) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const openTimestampBN = new BN(openTimestamp);

      // Derive PDAs
      const [capsulePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('capsule'),
          wallet.publicKey.toBuffer(),
          openTimestampBN.toArrayLike(Buffer, 'le', 8),
        ],
        PROGRAM_ID
      );

      const [nftMintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('nft_mint'), capsulePda.toBuffer()],
        PROGRAM_ID
      );

      const creatorNftAccount = await getAssociatedTokenAddress(
        nftMintPda,
        wallet.publicKey
      );

      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMintPda.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const tx = await (
        program.methods as Record<
          string,
          (...args: unknown[]) => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .initializeCapsule(
          metadataUri,
          openTimestampBN,
          new BN(votingDuration),
          new BN(quorum),
          name,
          symbol
        )
        .accountsPartial({
          capsule: capsulePda,
          nftMint: nftMintPda,
          creatorNftAccount: creatorNftAccount,
          metadataAccount: metadataPda,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          metadataProgram: TOKEN_METADATA_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return { tx, capsulePda };
    },
    [program, wallet]
  );

  const addStake = useCallback(
    async (
      capsulePda: PublicKey,
      amount: number,
      stakeDestination: StakeDestination,
      destinationAddress?: PublicKey
    ) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), capsulePda.toBuffer()],
        PROGRAM_ID
      );

      const stakeDestinationArg = { [stakeDestination]: {} };

      const tx = await (
        program.methods as Record<
          string,
          (...args: unknown[]) => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .addStake(
          new BN(amount),
          stakeDestinationArg,
          destinationAddress || null
        )
        .accountsPartial({
          capsule: capsulePda,
          escrow: escrowPda,
          stakeMint: SystemProgram.programId,
          creator: wallet.publicKey,
          creatorStakeAccount: wallet.publicKey,
          escrowStakeAccount: escrowPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      return tx;
    },
    [program, wallet]
  );

  const openForVoting = useCallback(
    async (capsulePda: PublicKey) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const tx = await (
        program.methods as Record<
          string,
          () => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .openForVoting()
        .accountsPartial({
          capsule: capsulePda,
        })
        .rpc();

      return tx;
    },
    [program, wallet]
  );

  const castVote = useCallback(
    async (capsulePda: PublicKey, vote: boolean) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [voterRecordPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('voter'),
          capsulePda.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );

      const tx = await (
        program.methods as Record<
          string,
          (vote: boolean) => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .castVote(vote)
        .accountsPartial({
          capsule: capsulePda,
          voterRecord: voterRecordPda,
          voter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    [program, wallet]
  );

  const resolveCapsule = useCallback(
    async (capsulePda: PublicKey) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const tx = await (
        program.methods as Record<
          string,
          () => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .resolveCapsule()
        .accountsPartial({
          capsule: capsulePda,
        })
        .rpc();

      return tx;
    },
    [program, wallet]
  );

  const claimStake = useCallback(
    async (capsulePda: PublicKey, recipientAddress?: PublicKey) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Fetch capsule to get stake details
      const capsuleAccount = await (
        program.account as Record<
          string,
          { fetch: (pda: PublicKey) => Promise<CapsuleAccount> }
        >
      ).capsule.fetch(capsulePda);

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), capsulePda.toBuffer()],
        PROGRAM_ID
      );

      // Determine recipient based on result and stake destination
      const recipient = recipientAddress || wallet.publicKey;

      // For SOL stakes (stake_mint = SystemProgram.programId), use wallet addresses
      const isNativeStake = capsuleAccount.stakeMint.equals(
        SystemProgram.programId
      );

      let escrowStakeAccount: PublicKey;
      let recipientStakeAccount: PublicKey;

      if (isNativeStake) {
        // For native SOL, escrow PDA holds SOL directly
        escrowStakeAccount = escrowPda;
        recipientStakeAccount = recipient;
      } else {
        // For SPL tokens, derive associated token accounts
        escrowStakeAccount = await getAssociatedTokenAddress(
          capsuleAccount.stakeMint,
          escrowPda,
          true // allowOwnerOffCurve for PDA
        );
        recipientStakeAccount = await getAssociatedTokenAddress(
          capsuleAccount.stakeMint,
          recipient
        );
      }

      const tx = await (
        program.methods as Record<
          string,
          () => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .claim()
        .accountsPartial({
          capsule: capsulePda,
          escrow: escrowPda,
          escrowStakeAccount: escrowStakeAccount,
          recipientStakeAccount: recipientStakeAccount,
          recipient: recipient,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    [program, wallet]
  );

  const cancelCapsule = useCallback(
    async (capsulePda: PublicKey) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Fetch capsule to check if it has stake
      const capsuleAccount = await (
        program.account as Record<
          string,
          { fetch: (pda: PublicKey) => Promise<CapsuleAccount> }
        >
      ).capsule.fetch(capsulePda);
      const hasStake = capsuleAccount.stakeAmount.toNumber() > 0;

      // Only derive escrow PDA if there's stake
      const escrowPda = hasStake
        ? PublicKey.findProgramAddressSync(
            [Buffer.from('escrow'), capsulePda.toBuffer()],
            PROGRAM_ID
          )[0]
        : null;

      const tx = await (
        program.methods as Record<
          string,
          () => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .cancelCapsule()
        .accountsPartial({
          capsule: capsulePda,
          escrow: escrowPda, // null if no stake
          escrowStakeAccount: null,
          creatorStakeAccount: null,
          creator: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    [program, wallet]
  );

  const closeCapsule = useCallback(
    async (capsulePda: PublicKey) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const tx = await (
        program.methods as Record<
          string,
          () => {
            accountsPartial: (accounts: object) => {
              rpc: () => Promise<string>;
            };
          }
        >
      )
        .closeCapsule()
        .accountsPartial({
          capsule: capsulePda,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    [program, wallet]
  );

  return {
    createCapsule,
    addStake,
    openForVoting,
    castVote,
    resolveCapsule,
    claimStake,
    cancelCapsule,
    closeCapsule,
  };
}
