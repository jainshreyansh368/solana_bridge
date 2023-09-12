use anchor_lang::prelude::*;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
#[account]
pub struct BridgeState {
    pub is_initialized: bool,
    pub token_mint: Pubkey,
    pub pda_token_account: Pubkey,
    pub token_name: String,
    pub chain: String,
    pub token_locked: u64,
    pub platform_fee: u64,
    pub min_lock_amount: u64,
}

impl BridgeState {
    // pub const LEN: usize = 1 + 32 + 32 + 4 + 10 + 4 + 10 + 8;
    pub const LEN: usize = 144;
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
#[account]
pub struct ClaimedTransaction {
    pub is_claimed: bool,
}

impl ClaimedTransaction {
    pub const LEN: usize = 1;
}

pub mod admin_key {
    use anchor_lang::declare_id;
    declare_id!("6a7ZaYRtUUsME6HoVWxcz9Rk5oqKuLxz4Atb8D7aiX6f");
}
