import {
  casingLosslessConvertToCamel,
  IdlProgram,
  IdlTypeFull,
  idlTypeFullJsonCodecExpression,
} from "solana-kiss";
import {
  utilCodeMinify,
  utilMakeObjectString,
  utilMapToVariableString,
  utilToCallString,
} from "../utils";

export function genInstructions(
  programIdl: IdlProgram,
  lines: Array<string>,
  dependencies: Set<string>,
) {
  if (programIdl.instructions.size === 0) {
    lines.push("");
    lines.push("const instructions = {};");
    return;
  }
  lines.push("");
  utilMapToVariableString(
    lines,
    symbolInstructionsPayloads,
    programIdl.instructions,
    (name, idl) => {
      const typeFull = IdlTypeFull.struct({ fields: idl.args.typeFullFields });
      const expression = idlTypeFullJsonCodecExpression(typeFull, dependencies);
      return { key: name, value: expression };
    },
  );
  lines.push("");
  utilMapToVariableString(
    lines,
    symbolInstructionsResults,
    programIdl.instructions,
    (name, idl) => {
      const typeFull = idl.return.typeFull;
      const expression = idlTypeFullJsonCodecExpression(typeFull, dependencies);
      return { key: name, value: expression };
    },
  );
  lines.push("");
  utilMapToVariableString(
    lines,
    "instructions",
    programIdl.instructions,
    (name, idl) => {
      const payloadJsonCodecExpression = `${symbolInstructionsPayloads}["${name}"]`;
      const resultJsonCodecExpression = `${symbolInstructionsResults}["${name}"]`;
      const addrAsyncType = utilMakeObjectString(
        idl.accounts.map((idlInstructionAccount) => {
          const name = casingLosslessConvertToCamel(idlInstructionAccount.name);
          if (
            idlInstructionAccount.address ||
            idlInstructionAccount.pda ||
            idlInstructionAccount.optional
          ) {
            return { key: name, value: "Pubkey", optional: true };
          }
          return { key: name, value: "Pubkey" };
        }),
      );
      const addrSyncType = utilMakeObjectString(
        idl.accounts.map((idlInstructionAccount) => {
          const name = casingLosslessConvertToCamel(idlInstructionAccount.name);
          if (idlInstructionAccount.address || idlInstructionAccount.optional) {
            return { key: name, value: "Pubkey", optional: true };
          }
          return { key: name, value: "Pubkey" };
        }),
      );
      const addrFullType = utilMakeObjectString(
        idl.accounts.map((idlInstructionAccount) => {
          const name = casingLosslessConvertToCamel(idlInstructionAccount.name);
          if (idlInstructionAccount.optional) {
            return { key: name, value: "Pubkey", optional: true };
          }
          return { key: name, value: "Pubkey" };
        }),
      );
      const payloadType = `JsonCodecContent<typeof ${payloadJsonCodecExpression}>`;
      const resultType = `JsonCodecContent<typeof ${resultJsonCodecExpression}>`;
      dependencies.add("JsonCodecContent");
      return {
        key: casingLosslessConvertToCamel(name),
        value: utilToCallString(
          `makeInstructionObject`,
          [addrAsyncType, addrSyncType, addrFullType, payloadType, resultType],
          [`"${name}"`, payloadJsonCodecExpression, resultJsonCodecExpression],
        ),
      };
    },
  );
  dependencies.add("Solana");
  dependencies.add("Pubkey");
  dependencies.add("JsonCodec");
  dependencies.add("InstructionRequest");
  dependencies.add("IdlInstructionAddresses");
  dependencies.add("IdlInstructionBlobAccountContent");
  dependencies.add("idlInstructionAccountsEncode");
  dependencies.add("idlInstructionAccountsDecode");
  dependencies.add("idlInstructionAccountsFind");
  dependencies.add("idlInstructionArgsEncode");
  dependencies.add("idlInstructionArgsDecode");
  dependencies.add("idlInstructionReturnDecode");
  lines.push("");
  lines.push(utilFunctionInstruction);
}

const symbolInstructionsPayloads = "instructionPayloadsJsonCodecs";
const symbolInstructionsResults = "instructionResultsJsonCodecs";

const utilFunctionInstruction = utilCodeMinify(`
function makeInstructionObject<AddressesAsync, AddressesSync, AddressesFull, Payload, Result>(
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
`);
