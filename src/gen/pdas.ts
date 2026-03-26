import {
  casingLosslessConvertToCamel,
  IdlPda,
  IdlPdaBlobConst,
  IdlPdaBlobInput,
  IdlProgram,
  idlTypeFullJsonCodecExpression,
  idlTypeFullJsonCodecTyping,
} from "solana-kiss";
import {
  utilCodeMinify,
  utilMakeObjectString,
  utilMapToVariableString,
  utilToCallString,
} from "../utils";

export function genPdas(
  programIdl: IdlProgram,
  lines: Array<string>,
  dependencies: Set<string>,
) {
  if (programIdl.pdas.size === 0) {
    lines.push("");
    lines.push("const pdas = {};");
    return;
  }
  lines.push("");
  utilMapToVariableString(lines, "pdas", programIdl.pdas, (name, idl) => {
    const expressions = new Array<{
      key: string;
      value: string;
      optional?: boolean;
    }>();
    const typings = new Array<{
      key: string;
      value: string;
      optional?: boolean;
    }>();
    pdaBlobsVisit(idl, expressions, dependencies, visitorExpression);
    pdaBlobsVisit(idl, typings, dependencies, visitorTyping);
    return {
      key: casingLosslessConvertToCamel(name),
      value: utilToCallString(
        `makePdaObject`,
        [utilMakeObjectString(typings)],
        [`"${name}"`, utilMakeObjectString(expressions)],
      ),
    };
  });
  dependencies.add("Pubkey");
  dependencies.add("JsonValue");
  dependencies.add("JsonCodec");
  dependencies.add("idlPdaFind");
  lines.push("");
  lines.push(makePda);
}

function pdaBlobsVisit<P1, P2>(
  self: IdlPda,
  p1: P1,
  p2: P2,
  visitor: {
    const: (self: IdlPdaBlobConst, p1: P1, p2: P2) => void;
    input: (self: IdlPdaBlobInput, p1: P1, p2: P2) => void;
  },
) {
  for (const blob of self.seeds) {
    blob.traverse(visitor, p1, p2);
  }
  if (self.program) {
    self.program.traverse(visitor, p1, p2);
  }
}

const visitorExpression = {
  const: () => {},
  input: (
    self: IdlPdaBlobInput,
    expressions: Array<{ key: string; value: string; optional?: boolean }>,
    dependencies: Set<string>,
  ) => {
    expressions.push({
      key: casingLosslessConvertToCamel(self.name),
      value: idlTypeFullJsonCodecExpression(self.typeFull, dependencies),
    });
  },
};

const visitorTyping = {
  const: () => {},
  input: (
    self: IdlPdaBlobInput,
    typings: Array<{ key: string; value: string; optional?: boolean }>,
    dependencies: Set<string>,
  ) => {
    typings.push({
      key: casingLosslessConvertToCamel(self.name),
      value: idlTypeFullJsonCodecTyping(self.typeFull, dependencies),
      optional: self.value !== null,
    });
  },
};

const makePda = utilCodeMinify(`
function makePdaObject<Inputs extends Record<string, any>>(
  pdaName: string,
  inputsJsonCodecs: Record<string, JsonCodec<any>>,
) {
  const idlPda = idlProgram.pdas.get(pdaName)!;
  return {
    find(inputs: Inputs, programAddress?: Pubkey): Pubkey {
      const inputsValues: Record<string, JsonValue> = {};
      for (const inputKey in inputsJsonCodecs) {
        if (inputs[inputKey] !== undefined) {
          inputsValues[inputKey] = inputsJsonCodecs[inputKey]!.encoder(
            inputs[inputKey],
          );
        }
      }
      return idlPdaFind(
        idlPda,
        inputsValues,
        programAddress ?? metadata.address,
      );
    },
  };
}
`);
