import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeCapsule } from "../target/types/time_capsule";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert } from "chai";

describe("time-capsule", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TimeCapsule as Program<TimeCapsule>;
  const creator = provider.wallet;
  
  // PDAs
  let capsulePda: PublicKey;
  let nftMintPda: PublicKey;
  let creatorNftAccount: PublicKey;
  let metadataPda: PublicKey;
  let escrowPda: PublicKey;
  
  // Constants
  const openTimestamp = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // Tomorrow
  const votingDuration = new anchor.BN(172800); // 48 hours
  const quorum = new anchor.BN(1);
  const metadataUri = "https://example.com/metadata.json";
  const name = "My Time Capsule";
  const symbol = "CAPSULE";
  
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  it("Is initialized!", async () => {
    // Derive PDAs
    [capsulePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("capsule"), creator.publicKey.toBuffer(), openTimestamp.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    [nftMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_mint"), capsulePda.toBuffer()],
      program.programId
    );
    
    creatorNftAccount = await getAssociatedTokenAddress(
      nftMintPda,
      creator.publicKey
    );
    
    [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        nftMintPda.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const tx = await program.methods
      .initializeCapsule(
        metadataUri,
        openTimestamp,
        votingDuration,
        quorum,
        name,
        symbol
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
      
    console.log("Your transaction signature", tx);
    
    // Verify state
    const capsuleAccount = await program.account.capsule.fetch(capsulePda);
    assert.equal(capsuleAccount.creator.toBase58(), creator.publicKey.toBase58());
    assert.equal(capsuleAccount.metadataUri, metadataUri);
    assert.equal(capsuleAccount.status.active !== undefined, true);
    assert.equal(capsuleAccount.stakeAmount.toNumber(), 0);
  });
  
  it("Adds stake (SOL)", async () => {
    const stakeAmount = new anchor.BN(1000000000); // 1 SOL
    
    [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), capsulePda.toBuffer()],
      program.programId
    );
    
    const tx = await program.methods
      .addStake(
        stakeAmount,
        { returnToCreator: {} }, // StakeDestination enum
        null // destination_address
      )
      .accountsPartial({
        capsule: capsulePda,
        escrow: escrowPda,
        stakeMint: SystemProgram.programId,
        creator: creator.publicKey,
        creatorStakeAccount: creator.publicKey, // Unused for SOL
        escrowStakeAccount: escrowPda, // Unused for SOL
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
      
    console.log("Add stake transaction", tx);
    
    // Verify stake amount
    const capsuleAccount = await program.account.capsule.fetch(capsulePda);
    assert.equal(capsuleAccount.stakeAmount.toNumber(), stakeAmount.toNumber());
    
    // Verify escrow balance
    const escrowBalance = await provider.connection.getBalance(escrowPda);
    assert.isAtLeast(escrowBalance, stakeAmount.toNumber());
  });

  it("Opens for voting", async () => {
    // Wait for open timestamp (if needed)
    // For test, we should have set it to now or very soon. 
    // In previous test, we set it to tomorrow. We need to create a new capsule for immediate testing.
    // Let's create a new capsule with short timestamps for this flow.
  });
});

describe("time-capsule-lifecycle", () => {
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

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  it("Runs full lifecycle", async () => {
    // 1. Initialize with immediate open time
    const openTimestamp = new anchor.BN(Math.floor(Date.now() / 1000) + 5); // 5 seconds from now
    const votingDuration = new anchor.BN(60); // 60 seconds voting period (devnet needs more time)
    const quorum = new anchor.BN(1);
    
    [capsulePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("capsule"), creator.publicKey.toBuffer(), openTimestamp.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    [nftMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_mint"), capsulePda.toBuffer()],
      program.programId
    );
    
    creatorNftAccount = await getAssociatedTokenAddress(nftMintPda, creator.publicKey);
    
    [metadataPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), nftMintPda.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID
    );

    await program.methods
      .initializeCapsule(
        "https://lifecycle.test",
        openTimestamp,
        votingDuration,
        quorum,
        "Lifecycle",
        "LIFE"
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
      
    console.log("Lifecycle capsule initialized");
    
    // 2. Add Stake
    [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), capsulePda.toBuffer()],
      program.programId
    );
    
    await program.methods.addStake(new anchor.BN(1000000), { returnToCreator: {} }, null)
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
      
    console.log("Stake added");

    // Wait for open timestamp
    await new Promise(resolve => setTimeout(resolve, 8000));

    // 3. Open for Voting
    await program.methods.openForVoting()
      .accountsPartial({
        capsule: capsulePda,
      })
      .rpc();
      
    console.log("Opened for voting");

    // 4. Cast Vote
    [voterRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("voter"), capsulePda.toBuffer(), creator.publicKey.toBuffer()],
      program.programId
    );

    await program.methods.castVote(true) // Yes vote
      .accountsPartial({
        capsule: capsulePda,
        voterRecord: voterRecordPda,
        voter: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
    console.log("Vote cast");

    // Wait for voting to end
    await new Promise(resolve => setTimeout(resolve, 65000));

    // 5. Resolve Capsule
    await program.methods.resolveCapsule()
      .accountsPartial({
        capsule: capsulePda,
      })
      .rpc();
      
    console.log("Capsule resolved");
    
    const capsuleAccount = await program.account.capsule.fetch(capsulePda);
    assert.ok(capsuleAccount.result.success);

    // 6. Claim Stake
    await program.methods.claim()
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
      
    console.log("Stake claimed");
  });
});
