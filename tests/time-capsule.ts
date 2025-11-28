import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeCapsule } from "../target/types/time_capsule";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";

describe("time-capsule", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TimeCapsule as Program<TimeCapsule>;
  const creator = provider.wallet as anchor.Wallet;

  // Test constants
  const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const metadataUri = "https://gateway.pinata.cloud/ipfs/QmTest123";
  const capsuleName = "Test Capsule";
  const capsuleSymbol = "TCAP";
  
  it("Creates a capsule without stake", async () => {
    const openTimestamp = new anchor.BN(Math.floor(Date.now() / 1000) + 60); // 1 minute from now
    const votingDuration = new anchor.BN(172800); // 48 hours
    const quorum = new anchor.BN(5);
    
    // Derive PDAs
    const [capsulePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("capsule"),
        creator.publicKey.toBuffer(),
        openTimestamp.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    
    const [nftMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_mint"), capsulePda.toBuffer()],
      program.programId
    );
    
    const creatorNftAccount = anchor.utils.token.associatedAddress({
      mint: nftMintPda,
      owner: creator.publicKey,
    });
    
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        nftMintPda.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
    
    // Create capsule
    const tx = await program.methods
      .initializeCapsule(
        metadataUri,
        openTimestamp,
        votingDuration,
        new anchor.BN(0), // No stake
        { returnToCreator: {} },
        null,
        quorum,
        capsuleName,
        capsuleSymbol
      )
      .accounts({
        capsule: capsulePda,
        nftMint: nftMintPda,
        creatorNftAccount,
        metadataAccount,
        escrow: null,
        stakeMint: SystemProgram.programId,
        creatorStakeAccount: null,
        escrowStakeAccount: null,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    
    console.log("Capsule created:", tx);
    
    // Fetch and verify capsule account
    const capsuleAccount = await program.account.capsule.fetch(capsulePda);
    assert.equal(capsuleAccount.creator.toString(), creator.publicKey.toString());
    assert.equal(capsuleAccount.metadataUri, metadataUri);
    assert.equal(capsuleAccount.stakeAmount.toNumber(), 0);
  });
  
  it("Opens capsule for voting", async () => {
    // This test would need to wait for the timestamp or manipulate time
    // For now, we'll skip the actual execution
    console.log("Test: Open for voting - requires time manipulation");
  });
  
  it("Casts votes on capsule", async () => {
    console.log("Test: Cast vote - requires open capsule");
  });
  
  it("Resolves capsule after voting", async () => {
    console.log("Test: Resolve capsule - requires completed voting");
  });
  
  it("Claims stake after resolution", async () => {
    console.log("Test: Claim stake - requires resolved capsule");
  });
  
  it("Cancels capsule before opening", async () => {
    console.log("Test: Cancel capsule - requires active capsule");
  });
});
