import {
  Program,
  web3,
  utils,
  BN,
  setProvider,
  AnchorProvider,
  workspace,
  Wallet,
} from "@coral-xyz/anchor";
import { BridgeContract } from "../target/types/bridge_contract";
import { initBridgeState } from "./initBridgeState"
import { lockToken } from "./lockToken"
import { unlockToken } from "./unlockToken"

import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createAssociatedTokenAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import { Connection } from "@solana/web3.js";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";


describe("bridge_contract", () => {
  // const admin = web3.Keypair.fromSecretKey(
  //   Uint8Array.from([
  //     27, 43, 88, 139, 14, 84, 29, 51, 131, 43, 34, 58, 199, 197, 120, 252, 127,
  //     137, 211, 183, 126, 106, 134, 56, 251, 5, 200, 144, 224, 57, 231, 123,
  //     233, 226, 120, 244, 95, 85, 8, 191, 229, 197, 98, 57, 158, 232, 138, 122,
  //     171, 136, 162, 122, 86, 44, 201, 212, 231, 252, 1, 155, 129, 46, 195, 164,
  //   ])
  // );

  // const user = web3.Keypair.fromSecretKey(
  //   Uint8Array.from([
  //     178, 253, 40, 1, 37, 116, 76, 138, 118, 93, 28, 20, 57, 68, 117, 213, 204,
  //     199, 2, 22, 93, 219, 25, 40, 155, 80, 72, 16, 77, 211, 65, 173, 11, 55,
  //     149, 216, 133, 87, 175, 7, 107, 39, 43, 253, 62, 248, 2, 199, 187, 172,
  //     213, 223, 127, 192, 131, 187, 20, 189, 170, 197, 19, 93, 135, 49,
  //   ])
  // );

  // // const mint = new web3.PublicKey("Cm61KHgzqbh8NRnbe4ic8HXdAgsnWNf45pnsTxT4Pncp");
  // const mint = web3.Keypair.fromSecretKey(
  //   Uint8Array.from([
  //     158, 224, 75, 70, 237, 128, 106, 87, 16, 22, 194, 68, 216, 193, 234, 160,
  //     20, 124, 15, 238, 100, 91, 76, 43, 241, 74, 105, 230, 99, 164, 107, 43,
  //     13, 177, 153, 139, 182, 20, 66, 144, 97, 76, 156, 20, 221, 194, 170, 51,
  //     144, 107, 7, 208, 174, 111, 175, 171, 115, 71, 150, 195, 81, 224, 166, 4,
  //   ])
  // );


  // console.log("admin acc ", admin.publicKey);

  // console.log("mint key ", mint.publicKey);


  // const payer = web3.Keypair.fromSecretKey(
  //   Uint8Array.from(
  //     [50,2,247,84,231,201,150,212,12,9,252,11,65,203,127,19,31,226,
  //       208,243,65,230,230,76,45,59,170,67,52,44,59,158,82,198,5,74,
  //       50,60,66,193,186,175,177,94,63,80,97,18,215,225,242,238,174,
  //       215,120,19,144,122,205,56,142,6,61,56
  //     ])
  // );

  
  // let provider = new AnchorProvider(
  //   new Connection("http://127.0.0.1:8899", "processed"),
  //   new Wallet(admin),
  //   {
  //     commitment: "processed",
  //     skipPreflight: true,
  //     preflightCommitment: "processed",
  //   }
  // );

  let admin = web3.Keypair.fromSecretKey(
    Uint8Array.from(
      [50,2,247,84,231,201,150,212,12,9,252,11,65,203,127,19,31,226,208,243,65,230,230,76,45,59,170,67,52,44,59,158,82,198,5,74,50,60,66,193,186,175,177,94,63,80,97,18,215,225,242,238,174,215,120,19,144,122,205,56,142,6,61,56]
    ));
    console.log("admin address : {}", admin.publicKey.toString());

    let user = web3.Keypair.fromSecretKey(
      Uint8Array.from(
        [124,254,178,113,85,219,221,93,194,6,141,195,190,189,108,95,166,166,163,222,185,199,251,192,187,37,192,132,71,36,197,28,240,200,112,134,59,25,138,37,167,206,213,57,244,145,50,183,67,142,211,82,245,169,86,196,173,65,40,107,128,158,178,75]      ));
      console.log("user address : {}", user.publicKey.toString());
  
  // let admin = new web3.PublicKey("6a7ZaYRtUUsME6HoVWxcz9Rk5oqKuLxz4Atb8D7aiX6f");

  let provider = new AnchorProvider(
    new Connection("https://api.devnet.solana.com", "processed"),
    new Wallet(admin),
    {
      commitment: "processed",
      skipPreflight: true,
      preflightCommitment: "processed",
    }
  );

  setProvider(provider);

  let mint = new web3.PublicKey("FXBVMf98w3XXeWXCo4juNLToTY3rftvWuJya9kvM7mBT");
  let dev_program_id = new web3.PublicKey("7oikCXiFBK5cqy4AJGrjaJNVhLNNB2eKgjxQXVHukuj4");
  let user_token_account = new web3.PublicKey("CBT648kjgENNx3Z64YGQUpTcYjW4DyEJR7rdjiakE2ir");
  let admin_token_account = new web3.PublicKey("3v4GwtRBPstV5FwG1Tr8Ne8DTaJyfQ67j2ZhRx3XQUfK");


  const program = workspace.BridgeContract as Program<BridgeContract>;

  // before("Airdrop wallet(s) and setup token accounts.", async () => {
  //   const signature = await program.provider.connection.requestAirdrop(
  //     admin.publicKey,
  //     3000000000
  //   );
  //   const latestBlockhash =
  //     await program.provider.connection.getLatestBlockhash();
  //   await program.provider.connection.confirmTransaction(
  //     {
  //       signature,
  //       ...latestBlockhash,
  //     },
  //     "confirmed"
  //   );

  //   let admin_token_account = await getAssociatedTokenAddress(
  //     mint.publicKey,
  //     admin.publicKey
  //   );

  //   let user_token_account = await getAssociatedTokenAddress(
  //     mint.publicKey,
  //     user.publicKey
  //   );

  // // create mint acc
  // const createMintTx = new web3.Transaction().add(
  //   web3.SystemProgram.createAccount({
  //     fromPubkey: program.provider.publicKey,
  //     newAccountPubkey: mint.publicKey,
  //     space: MINT_SIZE,
  //     lamports: await getMinimumBalanceForRentExemptMint(
  //       program.provider.connection
  //     ),
  //     programId: TOKEN_PROGRAM_ID,
  //   }),

  //   createInitializeMintInstruction(
  //     mint.publicKey,
  //     8,
  //     program.provider.publicKey,
  //     program.provider.publicKey
  //   ),

  //   createAssociatedTokenAccountInstruction(
  //     program.provider.publicKey,
  //     admin_token_account,
  //     admin.publicKey,
  //     mint.publicKey
  //   ),

  //   createAssociatedTokenAccountInstruction(
  //     program.provider.publicKey,
  //     user_token_account,
  //     user.publicKey,
  //     mint.publicKey
  //   ),

  //   createMintToCheckedInstruction(
  //     mint.publicKey,
  //     admin_token_account,
  //     admin.publicKey,
  //     100000000 * 100000000,
  //     8,
  //     [],
  //     TOKEN_PROGRAM_ID
  //   ),

  //   createMintToCheckedInstruction(
  //     mint.publicKey,
  //     user_token_account,
  //     admin.publicKey,
  //     10000 * 100000000,
  //     8,
  //     [],
  //     TOKEN_PROGRAM_ID
  //   )

  // );

  // await program.provider.sendAndConfirm(createMintTx, [mint]);
 

  // });

  console.log("program id of contract", dev_program_id.toString());

  const [bridgePda, bump] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(utils.bytes.utf8.encode("mantle")),
    mint.toBuffer(),
    ],
    dev_program_id
  );

  const [bridgeTokenAccount, nonce] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(utils.bytes.utf8.encode("token-seed")),
    mint.toBuffer(),
    ],
    dev_program_id
  );


  const claimed_txn = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(utils.bytes.utf8.encode("3333"))],
    dev_program_id
  )[0];

  console.log("claimed_trancation_key : ", claimed_txn.toString() );
  

  it("Admin Should be able to init bridge.", async () => {
  const bridge_data = await initBridgeState(
    program,
    admin, 
    mint,
    bridgePda,
    bridgeTokenAccount,
    dev_program_id,
    );

    // expect(bridge_data.isInitialized).equal(true);
    // let token_acc = await program.provider.connection.getAccountInfo(bridge_data.pdaTokenAccount);
    // console.log("token account : ", token_acc);
    
    let admin_token_account = await getAssociatedTokenAddress(
      mint,
      admin.publicKey
    );

    const claimed_txn = web3.PublicKey.findProgramAddressSync(
      [Buffer.from(utils.bytes.utf8.encode("234567"))],
      program.programId
    )[0];

    console.log("admin token account : ", admin_token_account);
    console.log("bridge token account : ", bridgeTokenAccount);
    console.log("claimed txn account : ", claimed_txn);

  });

  it("user Should be able to lock tokens.", async () => {
    // let admin_token_account = await getAssociatedTokenAddress(
    //   mint,
    //   admin.publicKey
    // );    
    // let user_token_account = await getAssociatedTokenAddress(
    //   mint,
    //   user.publicKey
    // );
    // console.log("user_token_account: ", user_token_account);

    const bridge_data = await lockToken(
      program,
      admin,
      user, 
      mint,
      bridgePda,
      bridgeTokenAccount,
      admin_token_account,
      );
  
      console.log("locking state token locked amount : ", bridge_data.tokenLocked.toNumber());

      const claimed_txn = web3.PublicKey.findProgramAddressSync(
        [Buffer.from(utils.bytes.utf8.encode("234567"))],
        program.programId
      )[0];

      console.log("claimed_trancation_key : ", claimed_txn.toString() );
      console.log("claimed_trancation_key : ", bridge_data.tokenLocked.toNumber() );
      
      expect(bridge_data.isInitialized).equal(true);

    });

    it("Admin Should be able to unlock tokens.", async () => {
      let user_token_account = await getAssociatedTokenAddress(
        mint,
        user.publicKey
      );
      
      const [claimed_txn, bump] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from(utils.bytes.utf8.encode("112"))],
        program.programId
      );

      const bridge_data = await unlockToken(
        program,
        admin, 
        mint,
        bridgePda,
        claimed_txn,
        bridgeTokenAccount,
        admin_token_account,
        );

        console.log("unlocking state token locked amount : ", bridge_data.tokenLocked.toNumber());
    
        expect(bridge_data.isInitialized).equal(true);
      });
      
});