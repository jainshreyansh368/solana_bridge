import { web3, Program, BN } from "@coral-xyz/anchor";
import { BridgeContract } from "../target/types/bridge_contract";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const unlockToken = async (
    program: Program<BridgeContract>,
    admin: web3.Keypair,
    token_mint: web3.PublicKey,
    bridge_state: web3.PublicKey,
    claimed_txn: web3.PublicKey,
    bridge_token_account: web3.PublicKey,
    user_token_account: web3.PublicKey,

  ) => {

    let txn_sign = await program.methods
    .unlockToken(
      new BN(200000000),
       new BN(112),
       "sdfghjklpoiuytrewq"
       )
        .accounts({
          admin: admin.publicKey,
          tokenMint: token_mint,
          bridgeState: bridge_state,
          claimedTransaction: claimed_txn,
          bridgeTokenAccount: bridge_token_account,
          userTokenAccount: user_token_account,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
    .signers([admin])
    .rpc();

    console.log("unlock fn txn: ", txn_sign);
    const bridge_state_acc = await program.account.bridgeState.fetch(bridge_state);
    return bridge_state_acc;
  };
  