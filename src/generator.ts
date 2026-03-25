import { IdlProgram, jsonStringify, Pubkey } from "solana-kiss";
import { genAccounts } from "./gen/accounts";
import { genInstructions } from "./gen/instructions";
import { genMetadata } from "./gen/metadata";
import { genPdas } from "./gen/pdas";

export function makeIdlModule(
  programAddress: Pubkey,
  programIdl: IdlProgram,
): string {
  programIdl.metadata.address = programAddress;
  const dependencies = new Set<string>();
  const lines = new Array<string>();
  lines.push("");
  dependencies.add("idlProgramParse");
  const idlJson = jsonStringify(programIdl.original.getJson());
  lines.push(`const idlProgram = idlProgramParse(${idlJson});`);
  genMetadata(programIdl, lines, dependencies);
  genInstructions(programIdl, lines, dependencies);
  genAccounts(programIdl, lines, dependencies);
  genPdas(programIdl, lines, dependencies);
  lines.unshift(`import {${[...dependencies].join(",")}} from "solana-kiss";`);
  return lines.join("\n");
}
