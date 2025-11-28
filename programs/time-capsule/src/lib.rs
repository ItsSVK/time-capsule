use anchor_lang::prelude::*;

declare_id!("CdnFqzmdDY1ArXRz1QbFbU1CtceN7xsz3mftJyosjM9u");

#[program]
pub mod time_capsule {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
