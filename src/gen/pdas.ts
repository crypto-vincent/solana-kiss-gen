import {
  casingLosslessConvertToCamel,
  IdlPdaBlobInput,
  IdlProgram,
  IdlTypeFull,
  IdlTypeFullFieldNamed,
  IdlTypeFullFields,
  idlTypeFullJsonCodecExpression,
} from "solana-kiss";
import {
  utilCodeMinify,
  utilMapToVariableString,
  utilToCallString,
} from "../utils";

export function genPdas(
  programIdl: IdlProgram,
  lines: Array<string>,
  dependencies: Set<string>,
) {
  if (programIdl.pdas.size === 0) {
    return;
  }
  lines.push("");
  utilMapToVariableString(
    lines,
    false,
    symbolPdasInputs,
    programIdl.pdas,
    (name, idl) => {
      const fields = new Array<IdlTypeFullFieldNamed>();
      for (const blob of idl.seeds) {
        blob.traverse(pdaBlobVisitor, fields, undefined);
      }
      if (idl.program) {
        idl.program.traverse(pdaBlobVisitor, fields, undefined);
      }
      const typeFullFields = IdlTypeFullFields.named(fields);
      const typeFull = IdlTypeFull.struct({ fields: typeFullFields });
      const expression = idlTypeFullJsonCodecExpression(typeFull, dependencies);
      return { key: name, value: expression };
    },
  );
  lines.push("");
  utilMapToVariableString(lines, true, "pdas", programIdl.pdas, (name) => {
    const inputsJsonCodecExpression = `${symbolPdasInputs}["${name}"]`;
    const inputsType = `JsonCodecContent<typeof ${inputsJsonCodecExpression}>`;
    dependencies.add("JsonCodecContent");
    return {
      key: casingLosslessConvertToCamel(name),
      value: utilToCallString(
        `makePdaObject`,
        [inputsType],
        [`"${name}"`, `${inputsJsonCodecExpression}`],
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

const symbolPdasInputs = "pdasInputsJsonCodec";

const pdaBlobVisitor = {
  const: () => {},
  input: (value: IdlPdaBlobInput, fields: Array<IdlTypeFullFieldNamed>) => {
    fields.push({
      name: casingLosslessConvertToCamel(value.name),
      content: value.typeFull,
    });
  },
};

const makePda = utilCodeMinify(`
function makePdaObject<Inputs>(
  pdaName: string,
  inputsJsonCodec: JsonCodec<Inputs>,
) {
  const idlPda = idlProgram.pdas.get(pdaName)!;
  return {
    find(inputs: Inputs, programAddress?: Pubkey): Pubkey {
      return idlPdaFind(
        idlPda,
        inputsJsonCodec.encoder(inputs) as Record<string, JsonValue>,
        programAddress ?? metadata.address,
      );
    },
  };
}
`);
