import {
  casingLosslessConvertToCamel,
  IdlProgram,
  idlTypeFullJsonCodecExpression,
} from "solana-kiss";
import {
  utilCodeMinify,
  utilMapToVariableString,
  utilToCallString,
} from "../utils";

export function genAccounts(
  programIdl: IdlProgram,
  lines: Array<string>,
  dependencies: Set<string>,
) {
  if (programIdl.accounts.size === 0) {
    return;
  }
  lines.push("");
  utilMapToVariableString(
    lines,
    false,
    symbolAccounts,
    programIdl.accounts,
    (name, idl) => {
      const typeFull = idl.typeFull;
      const expression = idlTypeFullJsonCodecExpression(typeFull, dependencies);
      return { key: name, value: expression };
    },
  );
  lines.push("");
  utilMapToVariableString(
    lines,
    true,
    "accounts",
    programIdl.accounts,
    (name) => {
      return {
        key: casingLosslessConvertToCamel(name),
        value: utilToCallString(
          `makeAccountObject`,
          [],
          [`"${name}"`, `${symbolAccounts}["${name}"]`],
        ),
      };
    },
  );
  dependencies.add("JsonCodec");
  dependencies.add("idlAccountDecode");
  lines.push("");
  lines.push(makeFunction);
}

const symbolAccounts = "accountsJsonCodec";

const makeFunction = utilCodeMinify(`
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
`);
