import {
  idlAccountDecode,
  idlInstructionAccountsEncode,
  idlInstructionAccountsFind,
  IdlInstructionAddresses,
  idlInstructionArgsEncode,
  IdlInstructionBlobAccountContent,
  idlInstructionReturnDecode,
  idlProgramParse,
  InstructionRequest,
  JsonCodec,
  jsonCodecBigInt,
  jsonCodecBoolean,
  jsonCodecConst,
  JsonCodecContent,
  jsonCodecNullable,
  jsonCodecNumber,
  jsonCodecObjectToObject,
  jsonCodecPubkey,
  Pubkey,
  pubkeyFromBase58,
  Solana,
} from "solana-kiss";

const idlProgram = idlProgramParse({
  name: "spl_token",
  instructions: {
    initialize_mint: {
      discriminator: [0],
      accounts: [
        { name: "mint", writable: true, signer: true },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111",
        },
      ],
      args: [
        { name: "decimals", type: "u8" },
        { name: "mint_authority", type: "pubkey" },
        { name: "freeze_authority", option: "pubkey" },
      ],
    },
    initialize_account: {
      discriminator: [1],
      accounts: [
        { name: "account", writable: true },
        { name: "mint" },
        { name: "owner" },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111",
        },
      ],
      args: [],
    },
    initialize_multisig: {
      discriminator: [2],
      args: [{ name: "m", type: "u8" }],
      accounts: [],
    },
    transfer: {
      discriminator: [3],
      args: [{ name: "amount", type: "u64" }],
      accounts: [
        { name: "source", writable: true },
        { name: "destination", writable: true },
        { name: "owner", signer: true },
      ],
    },
    approve: {
      discriminator: [4],
      args: [{ name: "amount", type: "u64" }],
      accounts: [
        { name: "source", writable: true },
        { name: "delegate" },
        { name: "owner", signer: true },
      ],
    },
    revoke: { discriminator: [5], args: [], accounts: [] },
    set_authority: {
      discriminator: [6],
      args: [
        {
          name: "authority_type",
          variants: [
            "MintTokens",
            "FreezeAccount",
            "AccountOwner",
            "CloseAccount",
          ],
        },
        { name: "new_authority", option: "pubkey" },
      ],
      accounts: [
        { name: "modified", writable: true },
        { name: "authority", signer: true },
      ],
    },
    mint_to: {
      discriminator: [7],
      args: [{ name: "amount", type: "u64" }],
      accounts: [
        { name: "mint", writable: true },
        { name: "account", writable: true },
        { name: "mint_authority", signer: true },
      ],
    },
    burn: {
      discriminator: [8],
      args: [{ name: "amount", type: "u64" }],
      accounts: [
        { name: "account", writable: true },
        { name: "mint", writable: true },
        { name: "owner", signer: true },
      ],
    },
    close: {
      discriminator: [9],
      args: [],
      accounts: [
        { name: "closed", writable: true },
        { name: "destination", writable: true },
        { name: "owner", signer: true },
      ],
    },
    freeze: {
      discriminator: [10],
      args: [],
      accounts: [
        { name: "account", writable: true },
        { name: "mint" },
        { name: "freeze_authority", signer: true },
      ],
    },
    thaw: {
      discriminator: [11],
      args: [],
      accounts: [
        { name: "account", writable: true },
        { name: "mint" },
        { name: "freeze_authority", signer: true },
      ],
    },
    transfer_checked: {
      discriminator: [12],
      args: [
        { name: "amount", type: "u64" },
        { name: "decimals", type: "u8" },
      ],
      accounts: [
        { name: "source", writable: true },
        { name: "mint" },
        { name: "destination", writable: true },
        { name: "owner", signer: true },
      ],
    },
    approve_checked: {
      discriminator: [13],
      args: [
        { name: "amount", type: "u64" },
        { name: "decimals", type: "u8" },
      ],
      accounts: [
        { name: "source", writable: true },
        { name: "mint" },
        { name: "delegate" },
        { name: "owner", signer: true },
      ],
    },
    mint_to_checked: {
      discriminator: [14],
      args: [
        { name: "amount", type: "u64" },
        { name: "decimals", type: "u8" },
      ],
      accounts: [
        { name: "mint", writable: true },
        { name: "destination", writable: true },
        { name: "mint_authority", signer: true },
      ],
    },
    burn_checked: {
      discriminator: [15],
      args: [
        { name: "amount", type: "u64" },
        { name: "decimals", type: "u8" },
      ],
      accounts: [
        { name: "source", writable: true },
        { name: "mint", writable: true },
        { name: "owner", signer: true },
      ],
    },
    initialize_account2: {
      discriminator: [16],
      args: [{ name: "owner", type: "pubkey" }],
      accounts: [
        { name: "account", writable: true },
        { name: "mint" },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111",
        },
      ],
    },
    sync_native: { discriminator: [17], args: [], accounts: [] },
    initialize_account3: {
      discriminator: [18],
      args: [{ name: "owner", type: "pubkey" }],
      accounts: [{ name: "account", writable: true }, { name: "mint" }],
    },
    initialize_multisig2: { discriminator: [19], args: [], accounts: [] },
    initialize_mint2: {
      discriminator: [20],
      args: [
        { name: "decimals", type: "u8" },
        { name: "mint_authority", type: "pubkey" },
        { name: "freeze_authority", option: "pubkey" },
      ],
      accounts: [],
    },
  },
  accounts: {
    TokenAccount: {
      space: 165,
      discriminator: [],
      fields: [
        { name: "mint", type: "pubkey" },
        { name: "owner", type: "pubkey" },
        { name: "amount", type: "u64" },
        { name: "delegate", coption: "pubkey" },
        {
          name: "state",
          type: { variants: ["Uninitialized", "Initialized", "Frozen"] },
        },
        { name: "is_native", coption: "u64" },
        { name: "delegated_amount", type: "u64" },
        { name: "close_authority", coption: "pubkey" },
      ],
    },
    TokenMint: {
      space: 82,
      discriminator: [],
      fields: [
        { name: "mint_authority", coption: "pubkey" },
        { name: "supply", type: "u64" },
        { name: "decimals", type: "u8" },
        { name: "is_initialized", type: "bool" },
        { name: "freeze_authority", coption: "pubkey" },
      ],
    },
  },
  types: {},
  errors: {},
});

export const metadata = {
  address: pubkeyFromBase58("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  name: "spl_token",
  source: undefined,
  version: undefined,
};

const instructionPayloadsJsonCodecs = {
  initialize_mint: jsonCodecObjectToObject({
    decimals: jsonCodecNumber,
    mintAuthority: jsonCodecPubkey,
    freezeAuthority: jsonCodecNullable(jsonCodecPubkey),
  }),
  initialize_account: jsonCodecConst(null),
  initialize_multisig: jsonCodecObjectToObject({ m: jsonCodecNumber }),
  transfer: jsonCodecObjectToObject({ amount: jsonCodecBigInt }),
  approve: jsonCodecObjectToObject({ amount: jsonCodecBigInt }),
  revoke: jsonCodecConst(null),
  set_authority: jsonCodecObjectToObject({
    authorityType: jsonCodecConst(
      "MintTokens",
      "FreezeAccount",
      "AccountOwner",
      "CloseAccount",
    ),
    newAuthority: jsonCodecNullable(jsonCodecPubkey),
  }),
  mint_to: jsonCodecObjectToObject({ amount: jsonCodecBigInt }),
  burn: jsonCodecObjectToObject({ amount: jsonCodecBigInt }),
  close: jsonCodecConst(null),
  freeze: jsonCodecConst(null),
  thaw: jsonCodecConst(null),
  transfer_checked: jsonCodecObjectToObject({
    amount: jsonCodecBigInt,
    decimals: jsonCodecNumber,
  }),
  approve_checked: jsonCodecObjectToObject({
    amount: jsonCodecBigInt,
    decimals: jsonCodecNumber,
  }),
  mint_to_checked: jsonCodecObjectToObject({
    amount: jsonCodecBigInt,
    decimals: jsonCodecNumber,
  }),
  burn_checked: jsonCodecObjectToObject({
    amount: jsonCodecBigInt,
    decimals: jsonCodecNumber,
  }),
  initialize_account2: jsonCodecObjectToObject({ owner: jsonCodecPubkey }),
  sync_native: jsonCodecConst(null),
  initialize_account3: jsonCodecObjectToObject({ owner: jsonCodecPubkey }),
  initialize_multisig2: jsonCodecConst(null),
  initialize_mint2: jsonCodecObjectToObject({
    decimals: jsonCodecNumber,
    mintAuthority: jsonCodecPubkey,
    freezeAuthority: jsonCodecNullable(jsonCodecPubkey),
  }),
};

const instructionResultsJsonCodecs = {
  initialize_mint: jsonCodecConst(null),
  initialize_account: jsonCodecConst(null),
  initialize_multisig: jsonCodecConst(null),
  transfer: jsonCodecConst(null),
  approve: jsonCodecConst(null),
  revoke: jsonCodecConst(null),
  set_authority: jsonCodecConst(null),
  mint_to: jsonCodecConst(null),
  burn: jsonCodecConst(null),
  close: jsonCodecConst(null),
  freeze: jsonCodecConst(null),
  thaw: jsonCodecConst(null),
  transfer_checked: jsonCodecConst(null),
  approve_checked: jsonCodecConst(null),
  mint_to_checked: jsonCodecConst(null),
  burn_checked: jsonCodecConst(null),
  initialize_account2: jsonCodecConst(null),
  sync_native: jsonCodecConst(null),
  initialize_account3: jsonCodecConst(null),
  initialize_multisig2: jsonCodecConst(null),
  initialize_mint2: jsonCodecConst(null),
};

export const instructions = {
  initializeMint: makeInstructionObject<
    { mint: Pubkey; rent?: Pubkey | undefined },
    { mint: Pubkey; rent?: Pubkey | undefined },
    { mint: Pubkey; rent: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["initialize_mint"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["initialize_mint"]>
  >(
    "initialize_mint",
    instructionPayloadsJsonCodecs["initialize_mint"],
    instructionResultsJsonCodecs["initialize_mint"],
  ),
  initializeAccount: makeInstructionObject<
    { account: Pubkey; mint: Pubkey; owner: Pubkey; rent?: Pubkey | undefined },
    { account: Pubkey; mint: Pubkey; owner: Pubkey; rent?: Pubkey | undefined },
    { account: Pubkey; mint: Pubkey; owner: Pubkey; rent: Pubkey },
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["initialize_account"]
    >,
    JsonCodecContent<
      (typeof instructionResultsJsonCodecs)["initialize_account"]
    >
  >(
    "initialize_account",
    instructionPayloadsJsonCodecs["initialize_account"],
    instructionResultsJsonCodecs["initialize_account"],
  ),
  initializeMultisig: makeInstructionObject<
    {},
    {},
    {},
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["initialize_multisig"]
    >,
    JsonCodecContent<
      (typeof instructionResultsJsonCodecs)["initialize_multisig"]
    >
  >(
    "initialize_multisig",
    instructionPayloadsJsonCodecs["initialize_multisig"],
    instructionResultsJsonCodecs["initialize_multisig"],
  ),
  transfer: makeInstructionObject<
    { source: Pubkey; destination: Pubkey; owner: Pubkey },
    { source: Pubkey; destination: Pubkey; owner: Pubkey },
    { source: Pubkey; destination: Pubkey; owner: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["transfer"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["transfer"]>
  >(
    "transfer",
    instructionPayloadsJsonCodecs["transfer"],
    instructionResultsJsonCodecs["transfer"],
  ),
  approve: makeInstructionObject<
    { source: Pubkey; delegate: Pubkey; owner: Pubkey },
    { source: Pubkey; delegate: Pubkey; owner: Pubkey },
    { source: Pubkey; delegate: Pubkey; owner: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["approve"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["approve"]>
  >(
    "approve",
    instructionPayloadsJsonCodecs["approve"],
    instructionResultsJsonCodecs["approve"],
  ),
  revoke: makeInstructionObject<
    {},
    {},
    {},
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["revoke"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["revoke"]>
  >(
    "revoke",
    instructionPayloadsJsonCodecs["revoke"],
    instructionResultsJsonCodecs["revoke"],
  ),
  setAuthority: makeInstructionObject<
    { modified: Pubkey; authority: Pubkey },
    { modified: Pubkey; authority: Pubkey },
    { modified: Pubkey; authority: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["set_authority"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["set_authority"]>
  >(
    "set_authority",
    instructionPayloadsJsonCodecs["set_authority"],
    instructionResultsJsonCodecs["set_authority"],
  ),
  mintTo: makeInstructionObject<
    { mint: Pubkey; account: Pubkey; mintAuthority: Pubkey },
    { mint: Pubkey; account: Pubkey; mintAuthority: Pubkey },
    { mint: Pubkey; account: Pubkey; mintAuthority: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["mint_to"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["mint_to"]>
  >(
    "mint_to",
    instructionPayloadsJsonCodecs["mint_to"],
    instructionResultsJsonCodecs["mint_to"],
  ),
  burn: makeInstructionObject<
    { account: Pubkey; mint: Pubkey; owner: Pubkey },
    { account: Pubkey; mint: Pubkey; owner: Pubkey },
    { account: Pubkey; mint: Pubkey; owner: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["burn"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["burn"]>
  >(
    "burn",
    instructionPayloadsJsonCodecs["burn"],
    instructionResultsJsonCodecs["burn"],
  ),
  close: makeInstructionObject<
    { closed: Pubkey; destination: Pubkey; owner: Pubkey },
    { closed: Pubkey; destination: Pubkey; owner: Pubkey },
    { closed: Pubkey; destination: Pubkey; owner: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["close"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["close"]>
  >(
    "close",
    instructionPayloadsJsonCodecs["close"],
    instructionResultsJsonCodecs["close"],
  ),
  freeze: makeInstructionObject<
    { account: Pubkey; mint: Pubkey; freezeAuthority: Pubkey },
    { account: Pubkey; mint: Pubkey; freezeAuthority: Pubkey },
    { account: Pubkey; mint: Pubkey; freezeAuthority: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["freeze"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["freeze"]>
  >(
    "freeze",
    instructionPayloadsJsonCodecs["freeze"],
    instructionResultsJsonCodecs["freeze"],
  ),
  thaw: makeInstructionObject<
    { account: Pubkey; mint: Pubkey; freezeAuthority: Pubkey },
    { account: Pubkey; mint: Pubkey; freezeAuthority: Pubkey },
    { account: Pubkey; mint: Pubkey; freezeAuthority: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["thaw"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["thaw"]>
  >(
    "thaw",
    instructionPayloadsJsonCodecs["thaw"],
    instructionResultsJsonCodecs["thaw"],
  ),
  transferChecked: makeInstructionObject<
    { source: Pubkey; mint: Pubkey; destination: Pubkey; owner: Pubkey },
    { source: Pubkey; mint: Pubkey; destination: Pubkey; owner: Pubkey },
    { source: Pubkey; mint: Pubkey; destination: Pubkey; owner: Pubkey },
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["transfer_checked"]
    >,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["transfer_checked"]>
  >(
    "transfer_checked",
    instructionPayloadsJsonCodecs["transfer_checked"],
    instructionResultsJsonCodecs["transfer_checked"],
  ),
  approveChecked: makeInstructionObject<
    { source: Pubkey; mint: Pubkey; delegate: Pubkey; owner: Pubkey },
    { source: Pubkey; mint: Pubkey; delegate: Pubkey; owner: Pubkey },
    { source: Pubkey; mint: Pubkey; delegate: Pubkey; owner: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["approve_checked"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["approve_checked"]>
  >(
    "approve_checked",
    instructionPayloadsJsonCodecs["approve_checked"],
    instructionResultsJsonCodecs["approve_checked"],
  ),
  mintToChecked: makeInstructionObject<
    { mint: Pubkey; destination: Pubkey; mintAuthority: Pubkey },
    { mint: Pubkey; destination: Pubkey; mintAuthority: Pubkey },
    { mint: Pubkey; destination: Pubkey; mintAuthority: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["mint_to_checked"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["mint_to_checked"]>
  >(
    "mint_to_checked",
    instructionPayloadsJsonCodecs["mint_to_checked"],
    instructionResultsJsonCodecs["mint_to_checked"],
  ),
  burnChecked: makeInstructionObject<
    { source: Pubkey; mint: Pubkey; owner: Pubkey },
    { source: Pubkey; mint: Pubkey; owner: Pubkey },
    { source: Pubkey; mint: Pubkey; owner: Pubkey },
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["burn_checked"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["burn_checked"]>
  >(
    "burn_checked",
    instructionPayloadsJsonCodecs["burn_checked"],
    instructionResultsJsonCodecs["burn_checked"],
  ),
  initializeAccount2: makeInstructionObject<
    { account: Pubkey; mint: Pubkey; rent?: Pubkey | undefined },
    { account: Pubkey; mint: Pubkey; rent?: Pubkey | undefined },
    { account: Pubkey; mint: Pubkey; rent: Pubkey },
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["initialize_account2"]
    >,
    JsonCodecContent<
      (typeof instructionResultsJsonCodecs)["initialize_account2"]
    >
  >(
    "initialize_account2",
    instructionPayloadsJsonCodecs["initialize_account2"],
    instructionResultsJsonCodecs["initialize_account2"],
  ),
  syncNative: makeInstructionObject<
    {},
    {},
    {},
    JsonCodecContent<(typeof instructionPayloadsJsonCodecs)["sync_native"]>,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["sync_native"]>
  >(
    "sync_native",
    instructionPayloadsJsonCodecs["sync_native"],
    instructionResultsJsonCodecs["sync_native"],
  ),
  initializeAccount3: makeInstructionObject<
    { account: Pubkey; mint: Pubkey },
    { account: Pubkey; mint: Pubkey },
    { account: Pubkey; mint: Pubkey },
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["initialize_account3"]
    >,
    JsonCodecContent<
      (typeof instructionResultsJsonCodecs)["initialize_account3"]
    >
  >(
    "initialize_account3",
    instructionPayloadsJsonCodecs["initialize_account3"],
    instructionResultsJsonCodecs["initialize_account3"],
  ),
  initializeMultisig2: makeInstructionObject<
    {},
    {},
    {},
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["initialize_multisig2"]
    >,
    JsonCodecContent<
      (typeof instructionResultsJsonCodecs)["initialize_multisig2"]
    >
  >(
    "initialize_multisig2",
    instructionPayloadsJsonCodecs["initialize_multisig2"],
    instructionResultsJsonCodecs["initialize_multisig2"],
  ),
  initializeMint2: makeInstructionObject<
    {},
    {},
    {},
    JsonCodecContent<
      (typeof instructionPayloadsJsonCodecs)["initialize_mint2"]
    >,
    JsonCodecContent<(typeof instructionResultsJsonCodecs)["initialize_mint2"]>
  >(
    "initialize_mint2",
    instructionPayloadsJsonCodecs["initialize_mint2"],
    instructionResultsJsonCodecs["initialize_mint2"],
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
    decodeReturn(instructionReturned: Uint8Array) {
      const { instructionResult } = idlInstructionReturnDecode(
        idlInstruction,
        instructionReturned,
      );
      return { instructionResult: resultJsonCodec.decoder(instructionResult) };
    },
  };
}

const accountsJsonCodecs = {
  TokenAccount: jsonCodecObjectToObject({
    mint: jsonCodecPubkey,
    owner: jsonCodecPubkey,
    amount: jsonCodecBigInt,
    delegate: jsonCodecNullable(jsonCodecPubkey),
    state: jsonCodecConst("Uninitialized", "Initialized", "Frozen"),
    isNative: jsonCodecNullable(jsonCodecBigInt),
    delegatedAmount: jsonCodecBigInt,
    closeAuthority: jsonCodecNullable(jsonCodecPubkey),
  }),
  TokenMint: jsonCodecObjectToObject({
    mintAuthority: jsonCodecNullable(jsonCodecPubkey),
    supply: jsonCodecBigInt,
    decimals: jsonCodecNumber,
    isInitialized: jsonCodecBoolean,
    freezeAuthority: jsonCodecNullable(jsonCodecPubkey),
  }),
};

export const accounts = {
  TokenAccount: makeAccountObject(
    "TokenAccount",
    accountsJsonCodecs["TokenAccount"],
  ),
  TokenMint: makeAccountObject("TokenMint", accountsJsonCodecs["TokenMint"]),
};

function makeAccountObject<State>(
  accountName: string,
  stateJsonCodec: JsonCodec<State>,
) {
  const idlAccount = idlProgram.accounts.get(accountName)!;
  return {
    decode(accountData: Uint8Array) {
      const accountState = stateJsonCodec.decoder(
        idlAccountDecode(idlAccount, accountData),
      );
      return { accountState };
    },
  };
}
