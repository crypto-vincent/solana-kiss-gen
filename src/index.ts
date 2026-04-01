import {
  command,
  commandWithSubcommands,
  operation,
  optionSingleValue,
  positionalRequired,
  runAndExit,
  Type,
  typePath,
  typeRenamed,
} from "cli-kiss";
import { promises as fsp } from "node:fs";
import {
  idlProgramParse,
  jsonParse,
  Pubkey,
  pubkeyFromBase58,
  Solana,
  urlRpcFromUrlOrMoniker,
  urlRpcPublicMainnet,
} from "solana-kiss";
import { version } from "../package.json";
import { makeIdlModule } from "./generator";

const typePubkey: Type<Pubkey> = {
  content: "Pubkey",
  decoder: pubkeyFromBase58,
};

const idlFileCommand = command(
  { description: "Generate a typescript module from an IDL file" },
  operation(
    {
      options: {},
      positionals: [
        positionalRequired({
          description: "Path to the IDL file",
          type: typePath("idl-file-path", { checkSyncExistAs: "file" }),
        }),
        positionalRequired({
          description: "Program address (Program Id)",
          type: typeRenamed(typePubkey, "program-address"),
        }),
      ],
    },
    async (_, { positionals: [idlFilePath, programAddress] }) => {
      const programIdl = idlProgramParse(
        jsonParse(await fsp.readFile(idlFilePath, "utf8")),
      );
      console.log(makeIdlModule(programAddress, programIdl));
    },
  ),
);

const fetchIdlCommand = command(
  {
    description:
      "Generate a typescript module by fetching an existing onchain IDL",
  },
  operation(
    {
      options: {
        rpcUrl: optionSingleValue({
          description: "Solana RPC URL or moniker",
          long: "rpc",
          type: {
            content: "url-or-moniker",
            decoder: urlRpcFromUrlOrMoniker,
          },
          defaultWhenNotDefined: () => urlRpcPublicMainnet,
        }),
      },
      positionals: [
        positionalRequired({
          description: "Program address (Program Id)",
          type: typeRenamed(typePubkey, "program-address"),
        }),
      ],
    },
    async (_, { options: { rpcUrl }, positionals: [programAddress] }) => {
      const solana = new Solana(rpcUrl);
      const { programIdl } = await solana.getOrLoadProgramIdl(programAddress);
      programIdl.metadata.address = programAddress;
      console.log(makeIdlModule(programAddress, programIdl));
    },
  ),
);

const rootCommand = commandWithSubcommands(
  {
    description: "IDL to Typescript module generator",
    details: [
      "Generate a typescript module from an IDL.",
      "Access typed accounts, instructions and PDAs.",
      "The generated code will be usable with the solana-kiss library.",
    ],
  },
  operation({ options: {}, positionals: [] }, async () => {}),
  {
    "fetch-idl": fetchIdlCommand,
    "idl-file": idlFileCommand,
  },
);

runAndExit("solana-kiss-gen", process.argv.slice(2), undefined, rootCommand, {
  buildVersion: version,
});
