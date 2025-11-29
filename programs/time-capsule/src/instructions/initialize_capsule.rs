use anchor_lang::{prelude::*, system_program::{System as SystemProgram}};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount},
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3, Metadata,
    },
};

use crate::state::*;
use crate::error::TimeCapsuleError;
use crate::events::CapsuleCreated;

pub fn handler(
    ctx: Context<InitializeCapsule>,
    metadata_uri: String,
    open_timestamp: i64,
    voting_duration: i64,
    quorum: u64,
    name: String,
    symbol: String,
) -> Result<()> {
    let clock = Clock::get()?;
    
    // Validate timestamp is in the future
    require!(
        open_timestamp > clock.unix_timestamp,
        TimeCapsuleError::InvalidTimestamp
    );
    
    // Validate metadata URI length
    require!(
        metadata_uri.len() <= Capsule::MAX_URI_LENGTH,
        TimeCapsuleError::MetadataUriTooLong
    );
    
    let capsule = &mut ctx.accounts.capsule;
    let nft_mint = &ctx.accounts.nft_mint;
    
    // Initialize capsule state
    capsule.creator = ctx.accounts.creator.key();
    capsule.owner = ctx.accounts.creator.key();
    capsule.nft_mint = nft_mint.key();
    capsule.metadata_uri = metadata_uri.clone();
    capsule.open_timestamp = open_timestamp;
    capsule.voting_end_timestamp = 0; // Set when opened
    capsule.voting_duration = voting_duration;
    capsule.status = CapsuleStatus::Active;
    capsule.yes_votes = 0;
    capsule.no_votes = 0;
    capsule.quorum = quorum;
    capsule.stake_amount = 0; // No stake for MVP
    capsule.stake_mint = SystemProgram::id();
    capsule.stake_destination = StakeDestination::ReturnToCreator;
    capsule.destination_address = None;
    capsule.result = None;
    capsule.bump = ctx.bumps.capsule;
    
    // Mint NFT to creator
    let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token::MintTo {
            mint: ctx.accounts.nft_mint.to_account_info(),
            to: ctx.accounts.creator_nft_account.to_account_info(),
            authority: ctx.accounts.nft_mint.to_account_info(),
        },
    );
    
    let capsule_key = capsule.key();
    let seeds = &[
        b"nft_mint",
        capsule_key.as_ref(),
        &[ctx.bumps.nft_mint],
    ];
    let signer = &[&seeds[..]];
    
    token::mint_to(cpi_context.with_signer(signer), 1)?;
    
    // Create NFT metadata
    let metadata_ctx = CpiContext::new(
        ctx.accounts.metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(),
            mint: ctx.accounts.nft_mint.to_account_info(),
            mint_authority: ctx.accounts.nft_mint.to_account_info(),
            payer: ctx.accounts.creator.to_account_info(),
            update_authority: ctx.accounts.nft_mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
    );
    
    let data_v2 = DataV2 {
        name,
        symbol,
        uri: metadata_uri.clone(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };
    
    create_metadata_accounts_v3(
        metadata_ctx.with_signer(signer),
        data_v2,
        false, // is_mutable
        true,  // update_authority_is_signer
        None,  // collection_details
    )?;
    
    // Emit event
    emit!(CapsuleCreated {
        capsule: capsule.key(),
        creator: ctx.accounts.creator.key(),
        nft_mint: nft_mint.key(),
        open_timestamp,
        stake_amount: 0,
        metadata_uri,
    });
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(metadata_uri: String, open_timestamp: i64)]
pub struct InitializeCapsule<'info> {
    #[account(
        init,
        payer = creator,
        space = Capsule::LEN,
        seeds = [b"capsule", creator.key().as_ref(), open_timestamp.to_le_bytes().as_ref()],
        bump
    )]
    pub capsule: Account<'info, Capsule>,
    
    #[account(
        init,
        payer = creator,
        mint::decimals = 0,
        mint::authority = nft_mint,
        mint::freeze_authority = nft_mint,
        seeds = [b"nft_mint", capsule.key().as_ref()],
        bump
    )]
    pub nft_mint: Account<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = nft_mint,
        associated_token::authority = creator
    )]
    pub creator_nft_account: Account<'info, TokenAccount>,

    /// CHECK: Metadata account for the NFT
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}
