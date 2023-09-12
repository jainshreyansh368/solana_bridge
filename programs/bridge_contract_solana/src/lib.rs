use anchor_lang::{prelude::*, solana_program};
use anchor_spl::*;
use solana_program::program::{invoke, invoke_signed};

pub mod context;
pub mod error;
pub mod state;

use context::*;
use context::{InitBridgeState, LockToken, UnLockToken};
use error::BridgeError;

declare_id!("7oikCXiFBK5cqy4AJGrjaJNVhLNNB2eKgjxQXVHukuj4");

#[program]
pub mod bridge_contract {

    use super::*;

    pub fn init_bridge_state(
        ctx: Context<InitBridgeState>,
        name: String,
        chain: String,
    ) -> Result<()> {
        msg!("1111");
        if ctx.accounts.bridge_state.is_initialized {
            return Err(ProgramError::AccountAlreadyInitialized.into());
        }

        let bridge_state = &mut ctx.accounts.bridge_state;
        msg!("2222");

        bridge_state.is_initialized = true;
        bridge_state.token_mint = ctx.accounts.token_mint.to_account_info().key();
        bridge_state.pda_token_account = ctx.accounts.bridge_token_account.to_account_info().key();
        bridge_state.token_name = name;
        bridge_state.chain = chain;
        bridge_state.token_locked = 0;
        //todo add decimal equilent value
        bridge_state.platform_fee = 1;
        bridge_state.min_lock_amount = 10;
        msg!("333");

        Ok(())
    }

    pub fn update_bridge_state(
        ctx: Context<UpdateBridgeState>,
        platform_fee: u64,
        min_lock_amount: u64,
    ) -> Result<()> {
        if !ctx.accounts.bridge_state.is_initialized {
            return Err(ProgramError::AccountAlreadyInitialized.into());
        }

        let bridge_state = &mut ctx.accounts.bridge_state;

        //todo add decimal equilent value
        bridge_state.platform_fee = platform_fee;
        bridge_state.min_lock_amount = min_lock_amount;

        Ok(())
    }

    pub fn lock_token(
        ctx: Context<LockToken>,
        // token_locked
        amount: u64,
        // receivers_address
        mantle_gas_fee: u64,
        receiver_address: String,
    ) -> Result<()> {
        if !ctx.accounts.bridge_state.is_initialized {
            return Err(ProgramError::AccountAlreadyInitialized.into());
        }

        let bridge_state = &mut ctx.accounts.bridge_state;
        let admin = &ctx.accounts.admin;
        let pda_token_account = &ctx.accounts.bridge_token_account.to_account_info();
        let admin_token_account = &ctx.accounts.admin_token_account.to_account_info();
        let gari_fee_account = &ctx.accounts.gari_treasury_account.to_account_info();
        let token_program = &ctx.accounts.token_program.to_account_info();

        if amount < bridge_state.min_lock_amount {
            return Err(BridgeError::InvalidAmount)?;
        }

        // mantle gas fee + platform fee
        let fee = mantle_gas_fee
            .checked_add(bridge_state.platform_fee)
            .ok_or(BridgeError::MathError)?;

        let lock_amount = amount.checked_sub(fee).ok_or(BridgeError::MathError)?;

        //Transfer locking amount to the bridge's pda token acocunt
        let transfer_tx = token::spl_token::instruction::transfer(
            token_program.key,
            admin_token_account.key,
            pda_token_account.key,
            admin.key,
            &[],
            lock_amount,
        )?;
        invoke(
            &transfer_tx,
            &[
                admin_token_account.clone(),
                pda_token_account.clone(),
                admin.to_account_info().clone(),
                token_program.clone(),
            ],
        )?;

        // Transfer platform_fee + gas fee on chain2 to gari fee account
        let transfer_tx = token::spl_token::instruction::transfer(
            token_program.key,
            admin_token_account.to_account_info().key,
            gari_fee_account.key,
            admin.key,
            &[],
            fee,
        )?;
        invoke(
            &transfer_tx,
            &[
                admin_token_account.clone(),
                gari_fee_account.clone(),
                admin.to_account_info().clone(),
                token_program.clone(),
            ],
        )?;

        bridge_state.token_locked = bridge_state
            .token_locked
            .checked_add(lock_amount)
            .ok_or(BridgeError::MathError)?;

        let receiver_adress_memo = receiver_address;
        msg!("reciever address: {}", receiver_adress_memo);
        Ok(())
    }

    pub fn unlock_token(
        ctx: Context<UnLockToken>,
        amount: u64,
        txn_nonce: u64,
        lock_transaction_hash: String,
    ) -> Result<()> {
        if !ctx.accounts.bridge_state.is_initialized {
            return Err(ProgramError::AccountAlreadyInitialized.into());
        }

        let bridge_state = &mut ctx.accounts.bridge_state;
        let claimed_txn = &mut ctx.accounts.claimed_transaction;
        let pda_token_account = &ctx.accounts.bridge_token_account.to_account_info();
        let user_token_account = &ctx.accounts.user_token_account.to_account_info();
        let token_program = &ctx.accounts.token_program.to_account_info();
        let token_mint = &ctx.accounts.token_mint.to_account_info();

        if claimed_txn.is_claimed {
            msg!("txn already claimed");
            return Err(ProgramError::InvalidArgument.into());
        }

        let seeds = [b"mantle".as_ref(), token_mint.key.as_ref()];

        let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
        if bridge_state.key() != pda {
            return Err(ProgramError::InvalidAccountData.into());
        }

        let transfer_tx = token::spl_token::instruction::transfer(
            token_program.key,
            pda_token_account.key,
            user_token_account.key,
            bridge_state.to_account_info().key,
            &[],
            amount,
        )?;
        invoke_signed(
            &transfer_tx,
            &[
                pda_token_account.clone(),
                user_token_account.clone(),
                bridge_state.to_account_info().clone(),
                token_program.clone(),
            ],
            &[&[b"mantle".as_ref(), token_mint.key().as_ref(), &[bump]]],
        )?;

        bridge_state.token_locked = bridge_state
            .token_locked
            .checked_sub(amount)
            .ok_or(BridgeError::MathError)?;

        let txn_nonce_memo = txn_nonce.to_string();
        msg!(" transaction nonce: {}", txn_nonce_memo);

        let lock_transaction_hash_memo = lock_transaction_hash;
        msg!("lock transaction hash: {}", lock_transaction_hash_memo);
        Ok(())
    }
}
