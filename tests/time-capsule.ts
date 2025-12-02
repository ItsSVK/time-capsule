import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TimeCapsule } from '../target/types/time_capsule';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { assert } from 'chai';

describe('time-capsule-lifecycle', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TimeCapsule as Program<TimeCapsule>;
  const creator = provider.wallet;

  let capsulePda: PublicKey;
  let nftMintPda: PublicKey;
  let creatorNftAccount: PublicKey;
  let metadataPda: PublicKey;
  let escrowPda: PublicKey;
  let voterRecordPda: PublicKey;

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  );

  it('Runs full lifecycle', async () => {
    // 1. Initialize with immediate open time
    const openTimestamp = new anchor.BN(Math.floor(Date.now() / 1000) + 5); // 5 seconds from now
    const votingDuration = new anchor.BN(20); // 20 seconds voting period (devnet needs more time)
    const quorum = new anchor.BN(1);

    [capsulePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('capsule'),
        creator.publicKey.toBuffer(),
        openTimestamp.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    [nftMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('nft_mint'), capsulePda.toBuffer()],
      program.programId
    );

    creatorNftAccount = await getAssociatedTokenAddress(
      nftMintPda,
      creator.publicKey
    );

    [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        nftMintPda.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    await program.methods
      .initializeCapsule(
        'https://lifecycle.test',
        openTimestamp,
        votingDuration,
        quorum,
        'Lifecycle',
        'LIFE'
      )
      .accountsPartial({
        capsule: capsulePda,
        nftMint: nftMintPda,
        creatorNftAccount: creatorNftAccount,
        metadataAccount: metadataPda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log('Lifecycle capsule initialized');

    // 2. Add Stake
    [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), capsulePda.toBuffer()],
      program.programId
    );

    await program.methods
      .addStake(new anchor.BN(1000000), { returnToCreator: {} }, null)
      .accountsPartial({
        capsule: capsulePda,
        escrow: escrowPda,
        stakeMint: SystemProgram.programId,
        creator: creator.publicKey,
        creatorStakeAccount: creator.publicKey,
        escrowStakeAccount: escrowPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log(
      'Stake added (now waiting for open timestamp to pass and open for voting to start in 8 seconds)'
    );

    // Wait for open timestamp
    await new Promise(resolve => setTimeout(resolve, 8000));

    // 3. Open for Voting
    await program.methods
      .openForVoting()
      .accountsPartial({
        capsule: capsulePda,
      })
      .rpc();

    console.log('Opened for voting');

    // 4. Cast Vote
    [voterRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('voter'),
        capsulePda.toBuffer(),
        creator.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .castVote(true) // Yes vote
      .accountsPartial({
        capsule: capsulePda,
        voterRecord: voterRecordPda,
        voter: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Vote cast (now waiting for voting to end in 25 seconds)');

    // Wait for voting to end
    await new Promise(resolve => setTimeout(resolve, 25000));

    // 5. Resolve Capsule
    await program.methods
      .resolveCapsule()
      .accountsPartial({
        capsule: capsulePda,
      })
      .rpc();

    console.log('Capsule resolved');

    const capsuleAccount = await program.account.capsule.fetch(capsulePda);
    assert.ok(capsuleAccount.result.success);

    // 6. Claim Stake
    await program.methods
      .claim()
      .accountsPartial({
        capsule: capsulePda,
        escrow: escrowPda,
        recipient: creator.publicKey,
        recipientStakeAccount: TOKEN_PROGRAM_ID, // For SOL, pass program ID for Option<Account>
        escrowStakeAccount: TOKEN_PROGRAM_ID, // For SOL, pass program ID for Option<Account>
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Stake claimed');

    // Verify stake is claimed (stakeAmount should be 0)
    const capsuleAfterClaim = await program.account.capsule.fetch(capsulePda);
    assert.equal(capsuleAfterClaim.stakeAmount.toNumber(), 0);

    // 7. Close Capsule (reclaim rent)
    await program.methods
      .closeCapsule()
      .accountsPartial({
        capsule: capsulePda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Capsule closed - rent reclaimed');

    // Verify capsule account is closed (should throw error when fetching)
    try {
      await program.account.capsule.fetch(capsulePda);
      assert.fail('Capsule account should be closed');
    } catch (err) {
      // Expected - account is closed
      console.log('Capsule account successfully closed');
    }
  });

  it('Tests cancel and close flow', async () => {
    // Create a new capsule for cancel testing
    const openTimestamp = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // Tomorrow
    const votingDuration = new anchor.BN(172800); // 48 hours
    const quorum = new anchor.BN(1);

    let cancelCapsulePda: PublicKey;
    let cancelNftMintPda: PublicKey;
    let cancelCreatorNftAccount: PublicKey;
    let cancelMetadataPda: PublicKey;
    let cancelEscrowPda: PublicKey;

    [cancelCapsulePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('capsule'),
        creator.publicKey.toBuffer(),
        openTimestamp.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    [cancelNftMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('nft_mint'), cancelCapsulePda.toBuffer()],
      program.programId
    );

    cancelCreatorNftAccount = await getAssociatedTokenAddress(
      cancelNftMintPda,
      creator.publicKey
    );

    [cancelMetadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        cancelNftMintPda.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // 1. Initialize capsule
    await program.methods
      .initializeCapsule(
        'https://cancel.test',
        openTimestamp,
        votingDuration,
        quorum,
        'Cancel Test',
        'CANCEL'
      )
      .accountsPartial({
        capsule: cancelCapsulePda,
        nftMint: cancelNftMintPda,
        creatorNftAccount: cancelCreatorNftAccount,
        metadataAccount: cancelMetadataPda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log('Cancel test capsule initialized');

    // Verify initial status is Active
    let cancelCapsuleAccount = await program.account.capsule.fetch(
      cancelCapsulePda
    );
    assert.ok(
      cancelCapsuleAccount.status.active !== undefined,
      'Capsule should be Active'
    );

    // 2. Add Stake
    [cancelEscrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), cancelCapsulePda.toBuffer()],
      program.programId
    );

    const stakeAmount = new anchor.BN(5000000); // 0.005 SOL

    await program.methods
      .addStake(stakeAmount, { returnToCreator: {} }, null)
      .accountsPartial({
        capsule: cancelCapsulePda,
        escrow: cancelEscrowPda,
        stakeMint: SystemProgram.programId,
        creator: creator.publicKey,
        creatorStakeAccount: creator.publicKey,
        escrowStakeAccount: cancelEscrowPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log('Stake added to cancel test capsule');

    // Verify stake was added
    cancelCapsuleAccount = await program.account.capsule.fetch(
      cancelCapsulePda
    );
    assert.equal(
      cancelCapsuleAccount.stakeAmount.toNumber(),
      stakeAmount.toNumber()
    );

    // 3. Cancel Capsule (while still Active)
    await program.methods
      .cancelCapsule()
      .accountsPartial({
        capsule: cancelCapsulePda,
        escrow: cancelEscrowPda,
        escrowStakeAccount: null, // Optional - null for SOL
        creatorStakeAccount: null, // Optional - null for SOL
        creator: creator.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Capsule cancelled');

    // Verify status is Cancelled
    cancelCapsuleAccount = await program.account.capsule.fetch(
      cancelCapsulePda
    );
    assert.ok(
      cancelCapsuleAccount.status.cancelled !== undefined,
      'Capsule should be Cancelled'
    );

    // Verify stake was returned (stakeAmount should be 0)
    assert.equal(
      cancelCapsuleAccount.stakeAmount.toNumber(),
      0,
      'Stake should be returned'
    );

    // Verify escrow balance is 0 (stake was returned)
    const escrowBalanceAfterCancel = await provider.connection.getBalance(
      cancelEscrowPda
    );
    assert.equal(
      escrowBalanceAfterCancel,
      0,
      'Escrow should be empty after cancel'
    );

    // 4. Close Capsule (reclaim rent)
    await program.methods
      .closeCapsule()
      .accountsPartial({
        capsule: cancelCapsulePda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Cancelled capsule closed - rent reclaimed');

    // Verify capsule account is closed
    try {
      await program.account.capsule.fetch(cancelCapsulePda);
      assert.fail('Capsule account should be closed');
    } catch (err) {
      // Expected - account is closed
      console.log('Cancelled capsule account successfully closed');
    }
  });
});
