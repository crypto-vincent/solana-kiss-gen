export function utilMakeVariableString(name: string, value: string) {
  return `const ${name} = ${value};`;
}

export function utilMakeObjectString(
  entries: Array<{ key: string; value: string; optional?: boolean }>,
  space?: number,
): string {
  entries.sort((a, b) => (a.optional ? 1 : 0) - (b.optional ? 1 : 0));
  const parts = new Array<string>();
  let first = true;
  parts.push("{");
  for (const { key, value, optional } of entries) {
    if (first) {
      first = false;
    } else {
      parts.push(",");
    }
    if (space !== undefined) {
      parts.push(`\n${" ".repeat(space)}`);
    }
    if (optional) {
      parts.push(`"${key}"?:${value}|undefined`);
    } else {
      parts.push(`"${key}":${value}`);
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
  name: string,
  map: Map<K, V>,
  mapper: (
    key: K,
    value: V,
  ) => { key: string; value: string; optional?: boolean },
) {
  const entries = utilMapToArray(map, mapper);
  const objectString = utilMakeObjectString(entries, 2);
  const variableString = utilMakeVariableString(name, objectString);
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

export function utilReplaceAll(
  str: string,
  searchValue: string,
  replaceValue: string,
): string {
  return str.split(searchValue).join(replaceValue);
}
