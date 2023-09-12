use anchor_lang::prelude::*;

#[error_code]
pub enum BridgeError {
    #[msg("Invalid starting timestamp")]
    InvalidStartingTimestamp,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("User's SPL wallet have insufficient funds")]
    InsufficientFunds,
    #[msg("Math Error")]
    MathError,
}
