import { web3, Program, BN } from "@coral-xyz/anchor";
import { BridgeContract} from "../target/types/bridge_contract";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const lockToken = async (
    program: Program<BridgeContract>,
    admin: web3.Keypair,
    user: web3.Keypair,
    token_mint: web3.PublicKey,
    bridge_state: web3.PublicKey,
    pda_token_account: web3.PublicKey,
    admin_token_account: web3.PublicKey,
  ) => {
    let txn_sign = await program.methods
      .lockToken(new BN(3000000000),
      new BN(2),
      "659enjyfgh65793jhdgye78uhegt63uhr"
      )
      .accounts({
        admin: admin.publicKey,
        tokenMint: token_mint,
        bridgeState: bridge_state,
        bridgeTokenAccount: pda_token_account,
        adminTokenAccount: admin_token_account,
        gariTreasuryAccount: admin_token_account,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    console.log("Lock transaction signature", txn_sign);
  
    const bridge_state_acc = await program.account.bridgeState.fetch(bridge_state);
    return bridge_state_acc;
  };
  