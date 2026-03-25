export function utilMakeVariableString(
  exported: boolean,
  name: string,
  value: string,
) {
  if (exported) {
    return `export const ${name} = ${value};`;
  }
  return `const ${name} = ${value};`;
}

export function utilMakeObjectString(
  entries: Array<{ key: string; value: string; optional?: boolean }>,
  space?: number,
): string {
  const parts = new Array<string>();
  parts.push("{");
  for (const { key, value, optional } of entries) {
    if (space !== undefined) {
      parts.push(`\n${" ".repeat(space)}`);
    }
    if (optional) {
      parts.push(`"${key}"?:${value} | undefined,`);
    } else {
      parts.push(`"${key}":${value},`);
    }
  }
  if (space !== undefined) {
    parts.push("\n");
  }
  parts.push("}");
  return parts.join("");
}

export function utilMapToArray<K, V, Out>(
  map: Map<K, V>,
  mapper: (key: K, value: V) => Out,
) {
  const array: Array<Out> = [];
  for (const [key, value] of map) {
    array.push(mapper(key, value));
  }
  return array;
}

export function utilMapToVariableString<K, V>(
  lines: Array<string>,
  exported: boolean,
  name: string,
  map: Map<K, V>,
  mapper: (
    key: K,
    value: V,
  ) => { key: string; value: string; optional?: boolean },
) {
  const entries = utilMapToArray(map, mapper);
  const objectString = utilMakeObjectString(entries, 2);
  const variableString = utilMakeVariableString(exported, name, objectString);
  lines.push(variableString);
}

export function utilToCallString(
  functionName: string,
  types: Array<string>,
  params: Array<string>,
): string {
  const typesString = types.length > 0 ? `<${types.join(",")}>` : "";
  const paramsString = params.join(",");
  return `${functionName}${typesString}(${paramsString})`;
}

export function utilCodeMinify(code: string): string {
  return code.replace(/\n/g, "").replace(/\s{2,}/g, "");
}
