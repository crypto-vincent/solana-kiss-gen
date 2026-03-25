import {jsonCodecConst,JsonCodecContent,Solana,Pubkey,JsonCodec,InstructionRequest,IdlInstructionAddresses,idlInstructionAccountsEncode,idlInstructionArgsEncode,idlInstructionReturnDecode,jsonCodecPubkey,jsonCodecObjectToObject,JsonValue,idlPdaFind,idlProgramParse} from "solana-kiss";

const idlProgram = idlProgramParse({"name":"spl_associated_token","instructions":{"create_idempotent":{"discriminator":[1],"args":[],"accounts":[{"name":"payer","writable":true,"signer":true},{"name":"ata","writable":true,"pda":{"seeds":[{"kind":"account","path":"owner"},{"kind":"account","path":"token_program"},{"kind":"account","path":"mint"}]}},{"name":"owner"},{"name":"mint"},{"name":"system_program","address":"11111111111111111111111111111111"},{"name":"token_program","address":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"}]},"create":{"discriminator":[],"args":[],"accounts":[{"name":"payer","writable":true,"signer":true},{"name":"ata","writable":true,"pda":{"seeds":[{"kind":"account","path":"owner"},{"kind":"account","path":"token_program"},{"kind":"account","path":"mint"}]}},{"name":"owner"},{"name":"mint"},{"name":"system_program","address":"11111111111111111111111111111111"},{"name":"token_program","address":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"}]}},"accounts":{},"types":{},"errors":{},"pdas":{"ata":{"seeds":[{"input":"owner","type":"pubkey"},{"input":"token_program","type":"pubkey","value":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"input":"mint","type":"pubkey"}]}}});

export const metadata = {
  "name":"spl_associated_token",
  "address":undefined,
  "source":undefined,
  "version":undefined,
};

const instructionPayloadsJsonCodecs = {
  "create_idempotent":jsonCodecConst(null),
  "create":jsonCodecConst(null),
};

const instructionResultsJsonCodecs = {
  "create_idempotent":jsonCodecConst(null),
  "create":jsonCodecConst(null),
};

export const instructions = {
  "createIdempotent":makeInstructionObject<{"payer":Pubkey,"ata"?:Pubkey | undefined,"owner":Pubkey,"mint":Pubkey,"systemProgram"?:Pubkey | undefined,"tokenProgram"?:Pubkey | undefined,},{"payer":Pubkey,"ata":Pubkey,"owner":Pubkey,"mint":Pubkey,"systemProgram"?:Pubkey | undefined,"tokenProgram"?:Pubkey | undefined,},{"payer":Pubkey,"ata":Pubkey,"owner":Pubkey,"mint":Pubkey,"systemProgram":Pubkey,"tokenProgram":Pubkey,},JsonCodecContent<typeof instructionPayloadsJsonCodecs["create_idempotent"]>,JsonCodecContent<typeof instructionResultsJsonCodecs["create_idempotent"]>>("create_idempotent",instructionPayloadsJsonCodecs["create_idempotent"],instructionResultsJsonCodecs["create_idempotent"]),
  "create":makeInstructionObject<{"payer":Pubkey,"ata"?:Pubkey | undefined,"owner":Pubkey,"mint":Pubkey,"systemProgram"?:Pubkey | undefined,"tokenProgram"?:Pubkey | undefined,},{"payer":Pubkey,"ata":Pubkey,"owner":Pubkey,"mint":Pubkey,"systemProgram"?:Pubkey | undefined,"tokenProgram"?:Pubkey | undefined,},{"payer":Pubkey,"ata":Pubkey,"owner":Pubkey,"mint":Pubkey,"systemProgram":Pubkey,"tokenProgram":Pubkey,},JsonCodecContent<typeof instructionPayloadsJsonCodecs["create"]>,JsonCodecContent<typeof instructionResultsJsonCodecs["create"]>>("create",instructionPayloadsJsonCodecs["create"],instructionResultsJsonCodecs["create"]),
};

function makeInstructionObject<AddressesAsync, AddressesSync, AddressesFull, Payload, Result>(instructionName: string,payloadJsonCodec: JsonCodec<Payload>,resultJsonCodec: JsonCodec<Result>,) {const idlInstruction = idlProgram.instructions.get(instructionName)!;return {async hydrateAndEncode(solana: Solana,instructionAddresses: AddressesAsync,instructionPayload: Payload,programAddress?: Pubkey,): Promise<{instructionRequest: InstructionRequest;instructionAddresses: AddressesFull;}> {const { instructionAddresses: hydratedInstructionAddresses } = await solana.hydrateInstructionAddresses(programAddress ?? metadata.address!, instructionName, {instructionAddresses: instructionAddresses as IdlInstructionAddresses,instructionPayload: payloadJsonCodec.encoder(instructionPayload),});const { instructionRequest } = await solana.hydrateAndEncodeInstruction(programAddress ?? metadata.address!,instructionName,{instructionAddresses: instructionAddresses as IdlInstructionAddresses,instructionPayload: payloadJsonCodec.encoder(instructionPayload),},);return { instructionRequest, instructionAddresses: hydratedInstructionAddresses as AddressesFull };},encode(instructionAddresses: AddressesSync,instructionPayload: Payload,programAddress?: Pubkey,): { instructionRequest: InstructionRequest } {const { instructionInputs } = idlInstructionAccountsEncode(idlInstruction,instructionAddresses as IdlInstructionAddresses,);const { instructionData } = idlInstructionArgsEncode(idlInstruction,payloadJsonCodec.encoder(instructionPayload),);const instructionRequest = {programAddress: programAddress ?? metadata.address!,instructionInputs,instructionData,};return { instructionRequest };},decodeReturn(instructionReturned: Uint8Array) {const { instructionResult } = idlInstructionReturnDecode(idlInstruction,instructionReturned,);return { instructionResult: resultJsonCodec.decoder(instructionResult) };},};}

const pdasInputsJsonCodec = {
  "ata":jsonCodecObjectToObject({owner:jsonCodecPubkey,tokenProgram:jsonCodecPubkey,mint:jsonCodecPubkey}),
};

export const pdas = {
  "ata":makePdaObject<JsonCodecContent<typeof pdasInputsJsonCodec["ata"]>>("ata",pdasInputsJsonCodec["ata"]),
};

function makePdaObject<Inputs>(pdaName: string,inputsJsonCodec: JsonCodec<Inputs>,) {const idlPda = idlProgram.pdas.get(pdaName)!;return {find(inputs: Inputs, programAddress?: Pubkey): Pubkey {return idlPdaFind(idlPda,inputsJsonCodec.encoder(inputs) as Record<string, JsonValue>,programAddress ?? metadata.address,);},};}
