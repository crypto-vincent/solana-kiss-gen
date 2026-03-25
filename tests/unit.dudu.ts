import { expect, it } from "@jest/globals";

import {
  lamportsRentExemptionMinimumForSpace,
  pubkeyFromBase58,
  signerFromSecret,
  signerGenerate,
  Solana,
} from "solana-kiss";
import * as Program_11111111111111111111111111111111 from "./fixtures/11111111111111111111111111111111";
import * as Program_ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL from "./fixtures/ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
import * as Program_TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA from "./fixtures/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

it("run", async () => {
  const dudu =
    Program_ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL.pdas.ata.find(
      {
        owner: pubkeyFromBase58("11111111111111111111111111111111"),
        tokenProgram: pubkeyFromBase58("11111111111111111111111111111111"),
        mint: pubkeyFromBase58("11111111111111111111111111111111"),
      },
      pubkeyFromBase58("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    );

  const solana = new Solana("devnet");
  const mintSigner = await signerGenerate();
  const payerSigner = await signerFromSecret(payerSecret);

  const dodo =
    Program_11111111111111111111111111111111.instructions.create.encode(
      { payer: payerSigner.address, created: mintSigner.address },
      {
        lamports: lamportsRentExemptionMinimumForSpace(1000),
        space: 1000n,
        owner:
          Program_TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA.metadata.address,
      },
    );
  console.log(dodo);
  const dada =
    await Program_TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA.instructions.initializeMint.hydrateAndEncode(
      solana,
      { mint: mintSigner.address },
      {
        decimals: 6,
        mintAuthority: payerSigner.address,
        freezeAuthority: null,
      },
    );
  console.log(dada);
  const results = await solana.prepareAndExecuteTransaction(
    payerSigner,
    [dodo.instructionRequest],
    { extraSigners: [mintSigner] },
  );
  console.log(results);

  expect(dada.instructionRequest).toEqual({});
  expect(dudu).toBe("2ZtLh7n1mLh3j8sH9iYpXoVqLZy5c6eHjv1uX9zQG8a");
});

const payerSecret = new Uint8Array([
  253, 106, 204, 143, 156, 225, 66, 188, 227, 208, 143, 26, 144, 47, 245, 32,
  217, 222, 212, 216, 243, 147, 179, 91, 179, 79, 3, 159, 237, 186, 36, 177, 62,
  57, 237, 150, 98, 58, 101, 43, 0, 142, 99, 249, 116, 205, 144, 75, 39, 143,
  146, 102, 197, 80, 18, 218, 155, 250, 102, 206, 200, 229, 228, 173,
]);
