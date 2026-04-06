import {
  command,
  commandWithSubcommands,
  operation,
  optionFlag,
  optionRepeatable,
  optionSingleValue,
  positionalOptional,
  positionalRequired,
  positionalVariadics,
  runAndExit,
  type,
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
          type: { content: "url-or-moniker", decoder: urlRpcFromUrlOrMoniker },
          defaultIfNotSpecified: () => urlRpcPublicMainnet,
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

const debugCommand = command(
  { description: "Debug command to test things" },
  operation(
    {
      options: {
        value1: optionFlag({
          description: "A boolean flag for debug purposes",
          long: "value1",
          short: "v1",
        }),
        value2: optionSingleValue({
          description: "A value for debug purposes",
          long: "value2",
          short: "v2",
          type: type("o2"),
          defaultIfNotSpecified: () => "default-value-1",
        }),
        value3: optionRepeatable({
          description: "A repeatable option for debug purposes",
          long: "value3",
          short: "v3",
          type: type("o3"),
        }),
      },
      positionals: [
        positionalRequired({
          description: "A required positional argument for debug purposes",
          type: type("p1"),
        }),
        positionalOptional({
          description: "An optional positional argument for debug purposes",
          type: type("p2"),
          default: () => "default-value-2",
        }),
        positionalVariadics({
          description: "Variadic positional arguments for debug purposes",
          type: type("p3"),
        }),
      ],
    },
    async (context, inputs) => {
      console.log("context:", context);
      console.log("inputs:", inputs);
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
    "debug": debugCommand,
  },
);

runAndExit("solana-kiss-gen", process.argv.slice(2), {}, rootCommand, {
  buildVersion: version,
  usageOnError: false,
});
