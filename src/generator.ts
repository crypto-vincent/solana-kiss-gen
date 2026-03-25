import { IdlProgram, jsonStringify } from "solana-kiss";
import { genAccounts } from "./gen/accounts";
import { genInstructions } from "./gen/instructions";
import { genPdas } from "./gen/pdas";
import { utilMakeObjectString, utilMakeVariableString } from "./utils";

export function makeIdlModule(programIdl: IdlProgram): string {
  const dependencies = new Set<string>();
  const lines = new Array<string>();
  genInstructions(programIdl, lines, dependencies);
  genAccounts(programIdl, lines, dependencies);
  genPdas(programIdl, lines, dependencies);
  if (lines.length === 0) {
    return "";
  }
  if (programIdl.metadata.address) {
    dependencies.add("pubkeyFromBase58");
  }
  const metadatas = new Array<{ key: string; value: string }>();
  metadatas.push({
    key: "name",
    value: programIdl.metadata.name
      ? `"${programIdl.metadata.name}"`
      : "undefined",
  });
  metadatas.push({
    key: "address",
    value: programIdl.metadata.address
      ? `pubkeyFromBase58("${programIdl.metadata.address}")`
      : "undefined",
  });
  metadatas.push({
    key: "source",
    value: programIdl.metadata.source
      ? `new URL("${programIdl.metadata.source}")`
      : "undefined",
  });
  metadatas.push({
    key: "version",
    value: programIdl.metadata.version
      ? `"${programIdl.metadata.version}"`
      : "undefined",
  });
  lines.unshift(
    utilMakeVariableString(
      true,
      "metadata",
      utilMakeObjectString(metadatas, 2),
    ),
  );
  lines.unshift("");
  const idlJson = jsonStringify(programIdl.original.getJson());
  dependencies.add("idlProgramParse");
  lines.unshift(`const idlProgram = idlProgramParse(${idlJson});`);
  lines.unshift("");
  lines.unshift(`import {${[...dependencies].join(",")}} from "solana-kiss";`);
  return lines.join("\n");
}
