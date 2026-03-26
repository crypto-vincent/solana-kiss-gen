import { IdlProgram } from "solana-kiss";
import { utilMakeObjectString, utilMakeVariableString } from "../utils";

export function genMetadata(
  programIdl: IdlProgram,
  lines: Array<string>,
  dependencies: Set<string>,
) {
  if (programIdl.metadata.address) {
    dependencies.add("pubkeyFromBase58");
  }
  const metadatas = new Array<{ key: string; value: string }>();
  metadatas.push({
    key: "address",
    value: `pubkeyFromBase58("${programIdl.metadata.address}")`,
  });
  metadatas.push({
    key: "name",
    value: programIdl.metadata.name
      ? `"${programIdl.metadata.name}"`
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
  lines.push("");
  lines.push(
    utilMakeVariableString("metadata", utilMakeObjectString(metadatas, 2)),
  );
}
