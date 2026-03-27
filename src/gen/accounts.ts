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
    lines.push("");
    lines.push("const accounts = {};");
    return;
  }
  lines.push("");
  utilMapToVariableString(
    lines,
    symbolAccounts,
    programIdl.accounts,
    (name, idl) => {
      const typeFull = idl.typeFull;
      const expression = idlTypeFullJsonCodecExpression(typeFull, dependencies);
      return { key: name, value: expression };
    },
  );
  lines.push("");
  utilMapToVariableString(lines, "accounts", programIdl.accounts, (name) => {
    return {
      key: casingLosslessConvertToCamel(name),
      value: utilToCallString(
        `makeAccountObject`,
        [],
        [`"${name}"`, `${symbolAccounts}["${name}"]`],
      ),
    };
  });
  dependencies.add("JsonCodec");
  dependencies.add("RpcHttp");
  dependencies.add("rpcHttpGetAccountWithData");
  dependencies.add("Pubkey");
  dependencies.add("idlAccountDecode");
  lines.push("");
  lines.push(makeFunction);
}

const symbolAccounts = "accountsJsonCodecs";

const makeFunction = utilCodeMinify(`
function makeAccountObject<State>(
  accountName: string,
  stateJsonCodec: JsonCodec<State>,
) {
  const idlAccount = idlProgram.accounts.get(accountName)!;
  return {
    async fetch(rpcHttp: RpcHttp, accountAddress: Pubkey) {
      const results = await rpcHttpGetAccountWithData(rpcHttp, accountAddress);
      const { accountState } = idlAccountDecode(
        idlAccount,
        results.accountData,
      );
      return { ...results, accountState: stateJsonCodec.decoder(accountState) };
    },
    decode(accountData: Uint8Array) {
      const { accountState } = idlAccountDecode(idlAccount, accountData);
      return { accountState: stateJsonCodec.decoder(accountState) };
    },
  };
}
`);
