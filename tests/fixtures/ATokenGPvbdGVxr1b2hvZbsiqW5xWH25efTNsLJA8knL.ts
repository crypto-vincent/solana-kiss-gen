import {
  idlInstructionAccountsDecode,
  idlInstructionAccountsEncode,
  idlInstructionAccountsFind,
  IdlInstructionAddresses,
  idlInstructionArgsDecode,
  idlInstructionArgsEncode,
  IdlInstructionBlobAccountContent,
  idlInstructionReturnDecode,
  idlPdaFind,
  idlProgramParse,
  InstructionRequest,
  JsonCodec,
  jsonCodecConst,
  JsonCodecContent,
  jsonCodecPubkey,
  JsonValue,
  Pubkey,
  pubkeyFromBase58,
  Solana,
} from "solana-kiss";

const idlProgram = idlProgramParse({
  name: "spl_associated_token",
  instructions: {
    create_idempotent: {
      discriminator: [1],
      args: [],
      accounts: [
        { name: "payer", writable: true, signer: true },
        {
          name: "ata",
          writable: true,
          pda: {
            seeds: [
              { kind: "account", path: "owner" },
              { kind: "account", path: "token_program" },
              { kind: "account", path: "mint" },
            ],
          },
        },
        { name: "owner" },
        { name: "mint" },
        { name: "system_program", address: "11111111111111111111111111111111" },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
      ],
    },
    create: {
      discriminator: [],
      args: [],
      accounts: [
        { name: "payer", writable: true, signer: true },
        {
          name: "ata",
          writable: true,
          pda: {
            seeds: [
              { kind: "account", path: "owner" },
              { kind: "account", path: "token_program" },
              { kind: "account", path: "mint" },
            ],
          },
        },
        { name: "owner" },
        { name: "mint" },
        { name: "system_program", address: "11111111111111111111111111111111" },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
      ],
    },
  },
  accounts: {},
  types: {},
  errors: {},
  pdas: {
    ata: {
      seeds: [
        { input: "owner", type: "pubkey" },
        {
          input: "token_program",
          type: "pubkey",
          value: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        { input: "mint", type: "pubkey" },
      ],
    },
  },
});

const metadata = {
  address: pubkeyFromBase58("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
  name: "spl_associated_token",
  source: new URL(
    "https://raw.githubusercontent.com/crypto-vincent/solana-idls/refs/heads/main/data/ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL.json",
  ),
  version: undefined,
};

const instructionPayloadsJsonCodecs = {
  create_idempotent: jsonCodecConst(null),
  create: jsonCodecConst(null),
};

const instructionResultsJsonCodecs = {
  create_idempotent: jsonCodecConst(null),
  create: jsonCodecConst(null),
};

const instructions = {
  createIdempotent: makeInstructionObject<
    {
      payer: Pubkey;
      owner: Pubkey;
      mint: Pubkey;
      ata?: Pubkey | undefined;
      systemProgram?: Pubkey | undefined;
      tokenProgram?: Pubkey | undefined;
    },
    {
      payer: Pubkey;
      ata: Pubkey;
      owner: Pubkey;
      mint: Pubkey;
      systemProgram?: Pubkey | undefined;
      tokenProgram?: Pubkey | undefined;
    },
    {
      payer: Pubkey;
      ata: Pubkey;
      owner: Pubkey;
      mint: Pubkey;
      systemProgram: Pubkey;
      tokenProgram: Pubkey;
    },
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["create_idempotent"]
    >,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["create_idempotent"]>
  >(
    "create_idempotent",
    instructionPayloadsJsonCodecs["create_idempotent"],
    instructionResultsJsonCodecs["create_idempotent"],
  ),
  create: makeInstructionObject<
    {
      payer: Pubkey;
      owner: Pubkey;
      mint: Pubkey;
      ata?: Pubkey | undefined;
      systemProgram?: Pubkey | undefined;
      tokenProgram?: Pubkey | undefined;
    },
    {
      payer: Pubkey;
      ata: Pubkey;
      owner: Pubkey;
      mint: Pubkey;
      systemProgram?: Pubkey | undefined;
      tokenProgram?: Pubkey | undefined;
    },
    {
      payer: Pubkey;
      ata: Pubkey;
      owner: Pubkey;
      mint: Pubkey;
      systemProgram: Pubkey;
      tokenProgram: Pubkey;
    },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["create"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["create"]>
  >(
    "create",
    instructionPayloadsJsonCodecs["create"],
    instructionResultsJsonCodecs["create"],
  ),
};

function makeInstructionObject<
  AddressesAsync,
  AddressesSync,
  AddressesFull,
  Payload,
  Result,
>(
  instructionName: string,
  payloadJsonCodec: JsonCodec<Payload>,
  resultJsonCodec: JsonCodec<Result>,
) {
  const idlInstruction = idlProgram.instructions.get(instructionName)!;
  return {
    async hydrateAndEncode(
      solana: Solana,
      instructionAddresses: AddressesAsync,
      instructionPayload: Payload,
    ): Promise<{
      instructionRequest: InstructionRequest;
      instructionAddresses: AddressesFull;
    }> {
      const encodedPayload = payloadJsonCodec.encoder(instructionPayload);
      const accountsCache = new Map<Pubkey, IdlInstructionBlobAccountContent>();
      const { instructionAddresses: hydratedInstructionAddresses } =
        await idlInstructionAccountsFind(idlInstruction, metadata.address, {
          instructionAddresses: instructionAddresses as IdlInstructionAddresses,
          instructionPayload: encodedPayload,
          accountFetcher: async (accountAddress: Pubkey) => {
            const accountCached = accountsCache.get(accountAddress);
            if (accountCached) {
              return accountCached;
            }
            const { accountIdl, accountState } =
              await solana.getAndInferAndDecodeAccount(accountAddress);
            const accountContent = {
              accountState,
              accountTypeFull: accountIdl.typeFull,
            };
            accountsCache.set(accountAddress, accountContent);
            return accountContent;
          },
        });
      const { instructionInputs } = idlInstructionAccountsEncode(
        idlInstruction,
        hydratedInstructionAddresses,
      );
      const { instructionData } = idlInstructionArgsEncode(
        idlInstruction,
        encodedPayload,
      );
      return {
        instructionRequest: {
          programAddress: metadata.address,
          instructionInputs,
          instructionData,
        },
        instructionAddresses: hydratedInstructionAddresses as AddressesFull,
      };
    },
    encode(
      instructionAddresses: AddressesSync,
      instructionPayload: Payload,
    ): { instructionRequest: InstructionRequest } {
      const { instructionInputs } = idlInstructionAccountsEncode(
        idlInstruction,
        instructionAddresses as IdlInstructionAddresses,
      );
      const { instructionData } = idlInstructionArgsEncode(
        idlInstruction,
        payloadJsonCodec.encoder(instructionPayload),
      );
      const instructionRequest = {
        programAddress: metadata.address,
        instructionInputs,
        instructionData,
      };
      return { instructionRequest };
    },
    decode(instructionRequest: InstructionRequest) {
      const { instructionAddresses } = idlInstructionAccountsDecode(
        idlInstruction,
        instructionRequest.instructionInputs,
      );
      const { instructionPayload } = idlInstructionArgsDecode(
        idlInstruction,
        instructionRequest.instructionData,
      );
      return {
        instructionAddresses: instructionAddresses as AddressesFull,
        instructionPayload: payloadJsonCodec.decoder(instructionPayload),
      };
    },
    getResult(instructionReturned: Uint8Array) {
      const { instructionResult } = idlInstructionReturnDecode(
        idlInstruction,
        instructionReturned,
      );
      return { instructionResult: resultJsonCodec.decoder(instructionResult) };
    },
  };
}

const accounts = {};

const pdas = {
  ata: makePdaObject<{
    owner: Pubkey;
    mint: Pubkey;
    tokenProgram?: Pubkey | undefined;
  }>("ata", {
    owner: jsonCodecPubkey,
    tokenProgram: jsonCodecPubkey,
    mint: jsonCodecPubkey,
  }),
};

function makePdaObject<Inputs extends Record<string, any>>(
  pdaName: string,
  inputsJsonCodecs: Record<string, JsonCodec<any>>,
) {
  const idlPda = idlProgram.pdas.get(pdaName)!;
  return {
    find(inputs: Inputs, programAddress?: Pubkey): Pubkey {
      const inputsValues: Record<string, JsonValue> = {};
      for (const inputKey in inputsJsonCodecs) {
        if (inputs[inputKey] !== undefined) {
          inputsValues[inputKey] = inputsJsonCodecs[inputKey]!.encoder(
            inputs[inputKey],
          );
        }
      }
      return idlPdaFind(
        idlPda,
        inputsValues,
        programAddress ?? metadata.address,
      );
    },
  };
}

export default { metadata, instructions, accounts, pdas };
