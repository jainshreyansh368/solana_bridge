import { web3, Program, BN, AnchorProvider,Wallet  } from "@coral-xyz/anchor";
import { BridgeContract } from "../target/types/bridge_contract";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, TransactionInstruction } from "@solana/web3.js";

export const initBridgeState = async (
    program: Program<BridgeContract>,
    admin: web3.Keypair,
    token_mint: web3.PublicKey,
    bridge_state: web3.PublicKey,
    bridge_token_account: web3.PublicKey,
    bridgeProgramId: web3.PublicKey,
  ) => {

    // let provider = new AnchorProvider(
    //   new Connection("https://api.devnet.solana.com", "processed"),
    //   new Wallet(admin),
    //   {
    //     commitment: "processed",
    //     skipPreflight: true,
    //     preflightCommitment: "processed",
    //   }
    // );

    // const initBridgeIx = new TransactionInstruction({
    //   programId: bridgeProgramId,
    //   keys: [
    //     { pubkey: admin.publicKey, isSigner: true, isWritable: false },
    //     {
    //       pubkey: token_mint,
    //       isSigner: false,
    //       isWritable: false,
    //     },
    //     {
    //       pubkey: bridge_state,
    //       isSigner: false,
    //       isWritable: true,
    //     },
    //     { pubkey: bridge_token_account, isSigner: false, isWritable: true },
    //     { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    //     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    //     { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
    //   ],
    //   data: Buffer.from(
    //     Uint8Array.of(0 ))
    // });

    // let tx = new web3.Transaction();
    // tx.add(...[initBridgeIx]);
    // await provider.sendAndConfirm(tx, [admin]);


    await program.methods
      .initBridgeState("gari_sol", "mantle")
      .accounts({
        admin: admin.publicKey,
        tokenMint: token_mint,
        bridgeState: bridge_state,
        bridgeTokenAccount: bridge_token_account,
        rent: web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
  
    const bridge_state_data = await program.account.bridgeState.fetch(bridge_state);
    return bridge_state_data;
  };
  