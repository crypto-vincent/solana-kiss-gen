import {jsonCodecBigInt,jsonCodecPubkey,jsonCodecObjectToObject,jsonCodecConst,JsonCodecContent,Solana,Pubkey,JsonCodec,InstructionRequest,IdlInstructionAddresses,idlInstructionAccountsEncode,idlInstructionArgsEncode,idlInstructionReturnDecode,idlAccountDecode,pubkeyFromBase58,idlProgramParse} from "solana-kiss";

const idlProgram = idlProgramParse({"name":"system","instructions":{"create":{"discriminator":[0,0,0,0],"args":[{"name":"lamports","type":"u64"},{"name":"space","type":"u64"},{"name":"owner","type":"publicKey"}],"accounts":[{"name":"payer","isMut":true,"isSigner":true},{"name":"created","isMut":true,"isSigner":true}]},"assign":{"discriminator":[1,0,0,0],"args":[{"name":"owner","type":"publicKey"}],"accounts":[{"name":"assigned","isMut":true,"isSigner":true}]},"transfer":{"discriminator":[2,0,0,0],"args":[{"name":"lamports","type":"u64"}],"accounts":[{"name":"payer","isMut":true,"isSigner":true},{"name":"receiver","isMut":true}]},"allocate":{"discriminator":[8,0,0,0],"args":[{"name":"space","type":"u64"}],"accounts":[{"name":"allocated","isMut":true,"isSigner":true}]}},"accounts":{"Account":{"discriminator":[],"fields":[]}},"types":{},"errors":{}});

export const metadata = {
  "name":"system",
  "address":pubkeyFromBase58("11111111111111111111111111111111"),
  "source":new URL("https://raw.githubusercontent.com/crypto-vincent/solana-idls/refs/heads/main/data/11111111111111111111111111111111.json"),
  "version":undefined,
};

const instructionPayloadsJsonCodecs = {
  "create":jsonCodecObjectToObject({lamports:jsonCodecBigInt,space:jsonCodecBigInt,owner:jsonCodecPubkey}),
  "assign":jsonCodecObjectToObject({owner:jsonCodecPubkey}),
  "transfer":jsonCodecObjectToObject({lamports:jsonCodecBigInt}),
  "allocate":jsonCodecObjectToObject({space:jsonCodecBigInt}),
};

const instructionResultsJsonCodecs = {
  "create":jsonCodecConst(null),
  "assign":jsonCodecConst(null),
  "transfer":jsonCodecConst(null),
  "allocate":jsonCodecConst(null),
};

export const instructions = {
  "create":makeInstructionObject<{"payer":Pubkey,"created":Pubkey,},{"payer":Pubkey,"created":Pubkey,},{"payer":Pubkey,"created":Pubkey,},JsonCodecContent<typeof instructionPayloadsJsonCodecs["create"]>,JsonCodecContent<typeof instructionResultsJsonCodecs["create"]>>("create",instructionPayloadsJsonCodecs["create"],instructionResultsJsonCodecs["create"]),
  "assign":makeInstructionObject<{"assigned":Pubkey,},{"assigned":Pubkey,},{"assigned":Pubkey,},JsonCodecContent<typeof instructionPayloadsJsonCodecs["assign"]>,JsonCodecContent<typeof instructionResultsJsonCodecs["assign"]>>("assign",instructionPayloadsJsonCodecs["assign"],instructionResultsJsonCodecs["assign"]),
  "transfer":makeInstructionObject<{"payer":Pubkey,"receiver":Pubkey,},{"payer":Pubkey,"receiver":Pubkey,},{"payer":Pubkey,"receiver":Pubkey,},JsonCodecContent<typeof instructionPayloadsJsonCodecs["transfer"]>,JsonCodecContent<typeof instructionResultsJsonCodecs["transfer"]>>("transfer",instructionPayloadsJsonCodecs["transfer"],instructionResultsJsonCodecs["transfer"]),
  "allocate":makeInstructionObject<{"allocated":Pubkey,},{"allocated":Pubkey,},{"allocated":Pubkey,},JsonCodecContent<typeof instructionPayloadsJsonCodecs["allocate"]>,JsonCodecContent<typeof instructionResultsJsonCodecs["allocate"]>>("allocate",instructionPayloadsJsonCodecs["allocate"],instructionResultsJsonCodecs["allocate"]),
};

function makeInstructionObject<AddressesAsync, AddressesSync, AddressesFull, Payload, Result>(instructionName: string,payloadJsonCodec: JsonCodec<Payload>,resultJsonCodec: JsonCodec<Result>,) {const idlInstruction = idlProgram.instructions.get(instructionName)!;return {async hydrateAndEncode(solana: Solana,instructionAddresses: AddressesAsync,instructionPayload: Payload,programAddress?: Pubkey,): Promise<{instructionRequest: InstructionRequest;instructionAddresses: AddressesFull;}> {const { instructionAddresses: hydratedInstructionAddresses } = await solana.hydrateInstructionAddresses(programAddress ?? metadata.address!, instructionName, {instructionAddresses: instructionAddresses as IdlInstructionAddresses,instructionPayload: payloadJsonCodec.encoder(instructionPayload),});const { instructionRequest } = await solana.hydrateAndEncodeInstruction(programAddress ?? metadata.address!,instructionName,{instructionAddresses: instructionAddresses as IdlInstructionAddresses,instructionPayload: payloadJsonCodec.encoder(instructionPayload),},);return { instructionRequest, instructionAddresses: hydratedInstructionAddresses as AddressesFull };},encode(instructionAddresses: AddressesSync,instructionPayload: Payload,programAddress?: Pubkey,): { instructionRequest: InstructionRequest } {const { instructionInputs } = idlInstructionAccountsEncode(idlInstruction,instructionAddresses as IdlInstructionAddresses,);const { instructionData } = idlInstructionArgsEncode(idlInstruction,payloadJsonCodec.encoder(instructionPayload),);const instructionRequest = {programAddress: programAddress ?? metadata.address!,instructionInputs,instructionData,};return { instructionRequest };},decodeReturn(instructionReturned: Uint8Array) {const { instructionResult } = idlInstructionReturnDecode(idlInstruction,instructionReturned,);return { instructionResult: resultJsonCodec.decoder(instructionResult) };},};}

const accountsJsonCodec = {
  "Account":jsonCodecConst(null),
};

export const accounts = {
  "Account":makeAccountObject("Account",accountsJsonCodec["Account"]),
};

function makeAccountObject<State>(accountName: string,stateJsonCodec: JsonCodec<State>,) {const idlAccount = idlProgram.accounts.get(accountName)!;return {decode(accountData: Uint8Array) {const accountState = stateJsonCodec.decoder(idlAccountDecode(idlAccount, accountData),);return { accountState };},};}
