import { expect, it } from "@jest/globals";
import {
  lamportsRentExemptionMinimumForSpace,
  pubkeyFromBase58,
  signerFromSecret,
  signerGenerate,
  Solana,
} from "solana-kiss";
import programSystem from "./fixtures/11111111111111111111111111111111";
import programAta from "./fixtures/ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
import programToken from "./fixtures/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

it("run", async () => {
  const solana = new Solana("devnet");

  const ataOwner = pubkeyFromBase58(
    "5UwX1EZUtFDo6wmwqQGxwYprQmraAxMEAwTocu5W5Ve8",
  );
  const ataMint = pubkeyFromBase58(
    "76wX8tHAzuqucfwNfgzxugumab6cwPL5ZGdHWi8vhL8s",
  );

  const ataAddress = programAta.pdas.ata.find({
    owner: ataOwner,
    mint: ataMint,
  });
  expect(ataAddress).toBe("G1hZxxBdb9sM1eQMVZCpe81PFvH4SyFK83Ue3wNrMUzr");

  const ataFetch = await programToken.accounts.TokenAccount.fetch(
    solana.getRpcHttp(),
    ataAddress,
  );
  expect(ataFetch.accountState.mint).toStrictEqual(ataMint);
  expect(ataFetch.accountState.owner).toStrictEqual(ataOwner);

  const payerSigner = await signerFromSecret(payerSecret);
  const mintSigner = await signerGenerate();

  const create = programSystem.instructions.create.encode(
    { payer: payerSigner.address, created: mintSigner.address },
    {
      lamports: lamportsRentExemptionMinimumForSpace(82),
      space: 82n,
      owner: programToken.metadata.address,
    },
  );
  const initializeMint =
    await programToken.instructions.initializeMint.hydrateAndEncode(
      solana,
      { mint: mintSigner.address },
      {
        decimals: 6,
        mintAuthority: payerSigner.address,
        freezeAuthority: payerSigner.address,
      },
    );

  const results = await solana.prepareAndExecuteTransaction(
    payerSigner,
    [create.instructionRequest, initializeMint.instructionRequest],
    { extraSigners: [mintSigner] },
  );
  expect(results.executionReport.transactionError).toStrictEqual(null);

  const mintFetch = await programToken.accounts.TokenMint.fetch(
    solana.getRpcHttp(),
    mintSigner.address,
  );
  expect(mintFetch.accountState.decimals).toStrictEqual(6);
  expect(mintFetch.accountState.mintAuthority).toStrictEqual(
    payerSigner.address,
  );
  expect(mintFetch.accountState.freezeAuthority).toStrictEqual(
    payerSigner.address,
  );

  const initializeMintRedecoded =
    programToken.instructions.initializeMint.decode(
      initializeMint.instructionRequest,
    );
  expect(initializeMintRedecoded.instructionAddresses).toStrictEqual({
    mint: mintSigner.address,
    rent: pubkeyFromBase58("SysvarRent111111111111111111111111111111111"),
  });
  expect(initializeMintRedecoded.instructionPayload).toStrictEqual({
    decimals: 6,
    mintAuthority: payerSigner.address,
    freezeAuthority: payerSigner.address,
  });
});

const payerSecret = new Uint8Array([
  253, 106, 204, 143, 156, 225, 66, 188, 227, 208, 143, 26, 144, 47, 245, 32,
  217, 222, 212, 216, 243, 147, 179, 91, 179, 79, 3, 159, 237, 186, 36, 177, 62,
  57, 237, 150, 98, 58, 101, 43, 0, 142, 99, 249, 116, 205, 144, 75, 39, 143,
  146, 102, 197, 80, 18, 218, 155, 250, 102, 206, 200, 229, 228, 173,
]);
