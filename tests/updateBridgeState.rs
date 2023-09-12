// import { web3, Program, BN } from "@coral-xyz/anchor";
// import { BridgeContract} from "../target/types/bridge_contract";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// export const updateBridgeState = async (
//     program: Program<BridgeContract>,
//     admin: web3.Keypair,
//     token_mint: web3.PublicKey,
//     bridge_state: web3.PublicKey,
//   ) => {
//     let txn_sign = await program.methods
//       .updateBridgeState(new BN(2),
//       new BN(3))
//       .accounts({
//         admin: admin.publicKey,
//         tokenMint: token_mint,
//         bridgeState: bridge_state,
//       })
//       .signers([admin])
//       .rpc();

//     console.log("Lock transaction signature", txn_sign);
  
//     const bridge_state_acc = await program.account.bridgeState.fetch(bridge_state);
//     return bridge_state_acc;
//   };
  