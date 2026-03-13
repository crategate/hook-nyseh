import {
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	address,
	pipe,
	createTransactionMessage,
	setTransactionMessageFeePayerSigner,
	setTransactionMessageLifetimeUsingBlockhash,
	appendTransactionMessageInstruction,
	signTransactionMessageWithSigners,
	sendAndConfirmTransactionFactory,
	airdropFactory,
	lamports,
	getSignatureFromTransaction,
	createKeyPairFromBytes,
	createSignerFromKeyPair,
	createKeyPairSignerFromBytes
} from '@solana/kit';
import fs from "fs";
import {
	TOKEN_PROGRAM_ADDRESS,
	fetchToken,
	getTransferInstruction,
	findAssociatedTokenPda,
	getCreateAssociatedTokenIdempotentInstruction
} from '@solana-program/token';
import { getTransferCheckedInstruction } from '@solana-program/token-2022';

(async () => {

	const payer = await createKeyPairSignerFromBytes(new Uint8Array(JSON.parse(fs.read())))
})
