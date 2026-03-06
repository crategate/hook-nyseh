import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HookNyseh } from "../target/types/hook_nyseh";

import { 
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  addExtraAccountsToInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";

describe("hook-nyseh", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.hookNyseh as Program<HookNyseh>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  const mint = new Keypair();
  const decimals = 9;

  const sourceTokenAccount = getAssociatedTokenAddressSync(
		mint.publicKey,
		wallet.publicKey,
		false,
		TOKEN_2022_PROGRAM_ID,
		ASSOCIATED_TOKEN_PROGRAM_ID
	);

  const recipient = Keypair.generate();
  const destinationTokenAccount = getAssociatedTokenAddressSync(
		mint.publicKey,
		recipient.publicKey,
		false,
		TOKEN_2022_PROGRAM_ID,
		ASSOCIATED_TOKEN_PROGRAM_ID
	);

	const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
		[Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
		program.programId
	);

	it("CREATE mint account with TRANSFER HOOK EXTENSION", async () => {
		const extensions = [ExtensionType.TransferHook];
		const mintLen = getMintLen(extensions);
		const lamports = 
		  await provider.connection.getMinimumBalanceForRentExemption(mintLen);
	})
  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
