use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::{admin_key, BridgeState, ClaimedTransaction};

#[derive(Accounts)]
pub struct InitBridgeState<'info> {
    #[account(mut, constraint = admin.key() == admin_key::id())]
    pub admin: Signer<'info>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = admin,
        space = 8 + BridgeState::LEN,
        seeds=[b"mantle".as_ref(), token_mint.key().as_ref()], 
        bump
    )]
    pub bridge_state: Account<'info, BridgeState>,
    #[account(
        init,
        seeds = [b"token-seed".as_ref(), token_mint.key().as_ref()],
        bump,
        payer = admin,
        token::mint = token_mint,
        token::authority = bridge_state,
    )]
    pub bridge_token_account: Account<'info, TokenAccount>,

    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBridgeState<'info> {
    #[account(mut, constraint = admin.key() == admin_key::id())]
    pub admin: Signer<'info>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        seeds=[b"mantle".as_ref(), token_mint.key().as_ref()], 
        bump)
    ]
    pub bridge_state: Account<'info, BridgeState>,
}

#[derive(Accounts)]
#[instruction(amount:u64)]
pub struct LockToken<'info> {
    #[account(mut, constraint = admin.key() == admin_key::id())]
    pub admin: Signer<'info>,
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds=[b"mantle".as_ref(), token_mint.key().as_ref()], 
        bump,
    )]
    pub bridge_state: Account<'info, BridgeState>,
    #[account(mut,
        seeds = [b"token-seed".as_ref(), token_mint.key().as_ref()],
        bump,
    )]
    pub bridge_token_account: Account<'info, TokenAccount>,

    // senders_address
    #[account(mut,
        constraint = admin_token_account.amount >= amount,
        constraint = &admin_token_account.owner == admin.key
    )]
    pub admin_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub gari_treasury_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    amount:u64,
    txn_nonce: u64,
)]
pub struct UnLockToken<'info> {
    #[account(mut, constraint = admin.key() == admin_key::id())]
    pub admin: Signer<'info>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds=[b"mantle".as_ref(), token_mint.key().as_ref()], 
        bump,
    )]
    pub bridge_state: Account<'info, BridgeState>,
    #[account(
        init,
        payer = admin,
        space = 8 + ClaimedTransaction::LEN,
        seeds=[txn_nonce.to_string().as_ref()],
        bump
    )]
    pub claimed_transaction: Account<'info, ClaimedTransaction>,

    #[account(mut,
        seeds = [b"token-seed".as_ref(), token_mint.key().as_ref()],
        bump,
        constraint = bridge_token_account.amount >= amount
    )]
    pub bridge_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
