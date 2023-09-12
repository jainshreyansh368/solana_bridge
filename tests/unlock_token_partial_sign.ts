// import { web3, Program, BN } from "@coral-xyz/anchor";
// import { BridgeContract } from "../target/types/bridge_contract";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// export const unlockToken = async (
//     program: Program<BridgeContract>,
//     admin: web3.Keypair,
//     user: web3.Keypair,
//     token_mint: web3.PublicKey,
//     bridge_state: web3.PublicKey,
//     claimed_txn: web3.PublicKey,
//     bridge_token_account: web3.PublicKey,
//     user_token_account: web3.PublicKey,

//   ) => {

//     const { blockhash } = await program.provider.connection.getLatestBlockhash("finalized");
//     let txn_partial_signed = new web3.Transaction(
//       {    recentBlockhash: blockhash,
//            feePayer: admin.publicKey,

//       }
//     );

//     txn_partial_signed.add(
//       program.instruction.unlockToken(
//         new BN(10000),
//          new BN(234),{
//           accounts:{
//             adminAcc: admin.publicKey,
//             user: user.publicKey,
//             tokenMint: token_mint,
//             bridgeState: bridge_state,
//             claimedTransaction: claimed_txn,
//             bridgeTokenAccount: bridge_token_account,
//             userTokenAccount: user_token_account,
//             tokenProgram: TOKEN_PROGRAM_ID,
//             systemProgram: web3.SystemProgram.programId,
//           },
//           signers: [admin, user]
//         }
//       )
//     );

//     // txn_partial_signed.partialSign(user);
//     console.log("partially signed transaction 1st", txn_partial_signed);

//   let txn_sign2 = program.provider.sendAndConfirm(txn_partial_signed, [admin, user])
//     console.log("Lock transaction signature", txn_sign2);

//     console.log("partially signed transaction 2nd", txn_partial_signed);

  
//     const bridge_state_acc = await program.account.bridgeState.fetch(bridge_state);
//     return bridge_state_acc;
//   };
  