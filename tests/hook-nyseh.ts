import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHook } from "../target/types/transfer_hook";

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
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

describe("hook-nyseh", () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace.hookNyseh as Program<TransferHook>;
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

		const transaction = new Transaction().add(
			SystemProgram.createAccount({
				fromPubkey: wallet.publicKey,
				newAccountPubkey: mint.publicKey,
				space: mintLen,
				lamports: lamports,
				programId: TOKEN_2022_PROGRAM_ID,
			}),
			createInitializeTransferHookInstruction(
				mint.publicKey,
				wallet.publicKey,
				program.programId,
				TOKEN_2022_PROGRAM_ID
			),
			createInitializeMintInstruction(
				mint.publicKey,
				decimals,
				wallet.publicKey,
				null,
				TOKEN_2022_PROGRAM_ID
			)
		);
		const txSig = await sendAndConfirmTransaction(
			provider.connection,
			transaction,
			[wallet.payer, mint]
		);
		console.log(`trans sig: **** ${txSig}`);
	});

	it("Create token accounts and mint tokens", async () => {
		const amount = 100 * 10 ** decimals;

		const transaction = new Transaction().add(
			createAssociatedTokenAccountInstruction(
				wallet.publicKey,
				sourceTokenAccount,
				wallet.publicKey,
				mint.publicKey,
				TOKEN_2022_PROGRAM_ID,
				ASSOCIATED_TOKEN_PROGRAM_ID
			),
			createAssociatedTokenAccountInstruction(
				wallet.publicKey,
				destinationTokenAccount,
				recipient.publicKey,
				mint.publicKey,
				TOKEN_2022_PROGRAM_ID,
				ASSOCIATED_TOKEN_PROGRAM_ID
			),
			createMintToInstruction(
				mint.publicKey,
				sourceTokenAccount,
				wallet.publicKey,
				amount,
				[],
				TOKEN_2022_PROGRAM_ID
			)
		);
		const txSig = await sendAndConfirmTransaction(
			connection,
			transaction,
			[wallet.payer],
			{ skipPreflight: true }
		);
		console.log(`trans sig: ${txSig}`);
	});

	it("CREATE ExtraAccountMetaList Account", async () => {
		const initializeExtraAccountMetaListInstruction = await program.methods
			.initializeExtraAccountMetaList()
			.accounts({
				mint: mint.publicKey,
				extraAccountMetaList: extraAccountMetaListPDA,
			})
			.instruction();
		const transaction = new Transaction().add(
			initializeExtraAccountMetaListInstruction
		);
		const txSig = await sendAndConfirmTransaction(
			provider.connection,
			transaction,
			[wallet.payer],
			{ skipPreflight: true }
		);
		console.log(`extraaccountMETA list Signature: ${txSig}`);
	});

	it("Transfer Hook with Extra Account Meta", async () => {
		const amount = 1 * 10 ** decimals;

		const transferInstruction = createTransferCheckedInstruction(
			sourceTokenAccount,
			mint.publicKey,
			destinationTokenAccount,
			wallet.publicKey,
			amount,
			decimals,
			[],
			TOKEN_2022_PROGRAM_ID
		);
		transferInstruction.keys.push(
			{
				pubkey: program.programId,
				isSigner: false,
				isWritable: false,
			},
			{
				pubkey: extraAccountMetaListPDA,
				isSigner: false,
				isWritable: false
			}
		);
		const transaction = new Transaction().add(transferInstruction);

		const txSig = await sendAndConfirmTransaction(
			connection,
			transaction,
			[wallet.payer],
			{ skipPreflight: true }
		)
		console.log(`final trns sig: ${txSig}`);
	})
});
