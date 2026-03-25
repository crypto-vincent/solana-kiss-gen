import {
  command,
  commandWithSubcommands,
  operation,
  optionSingleValue,
  positionalRequired,
  runAndExit,
  Type,
  typeString,
} from "cli-kiss";
import { promises as fsp } from "node:fs";
import {
  idlProgramParse,
  jsonParse,
  Pubkey,
  pubkeyFromBase58,
  Solana,
} from "solana-kiss";
import { makeIdlModule } from "./generator";

const typePubkey: Type<Pubkey> = {
  content: "Pubkey",
  decoder: pubkeyFromBase58,
};

const idlFilePathCommand = command(
  { description: "Generate by ?" },
  operation(
    {
      options: {},
      positionals: [
        positionalRequired({
          description: "?",
          label: "IDL_FILE_PATH",
          type: typeString,
        }),
        positionalRequired({
          description: "Program address",
          label: "PROGRAM_ADDRESS",
          type: typePubkey,
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

const programAddressCommand = command(
  { description: "Generate by fetching IDL by program address" },
  operation(
    {
      options: {
        rpcUrl: optionSingleValue({
          description: "Solana RPC URL or moniker",
          long: "rpc",
          label: "RPC_URL_OR_MONIKER",
          type: typeString,
          default: () => "mainnet",
        }),
      },
      positionals: [
        positionalRequired({
          description: "Program address",
          label: "PROGRAM_ADDRESS",
          type: typePubkey,
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
  { description: "TODO" },
  operation({ options: {}, positionals: [] }, async () => {
    return undefined;
  }),
  {
    "by-program-address": programAddressCommand,
    "by-idl-file-path": idlFilePathCommand,
  },
);

runAndExit("solana-kiss-gen", process.argv.slice(2), undefined, rootCommand, {
  buildVersion: process.env["NPM_PACKAGE_VERSION"] ?? "0.0.1",
});
