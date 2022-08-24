import * as ts from "typescript";
import { z } from "zod";
import { resolver } from "./target";

const filename = "src/target.ts";
const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename)!;
const typeChecker = program.getTypeChecker();

const extract = (symbol: any): string => {
  if (symbol.type.intrinsicName)
    return `${symbol.escapedName}:z.${symbol.type.intrinsicName}()`;

  if (symbol.type.members.size == 1) {
    const key = Array.from(symbol.type.members.keys())[0];
    return extract(symbol.type.members.get(key));
  }

  let aux: string[] = [];
  for (const key of Array.from(symbol.type.members.keys())) {
    aux.push(extract(symbol.type.members.get(key)));
  }
  return `${symbol.escapedName}:z.object({${aux}})`;
};

function recursivelyGenerateSchema(node: ts.Node, sourceFile: ts.SourceFile) {
  if (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) {
    if ((node as any).escapedName == `toString`) return;

    try {
      const symbols = typeChecker
        .getTypeAtLocation(node)
        .getCallSignatures()[0]
        .getReturnType()
        .getProperties();

      const arr = symbols.map((s) => {
        if (
          s.name === "toString" ||
          s.name === "toFixed" ||
          s.name === "toExponential" ||
          s.name === "toPrecision" ||
          s.name === "valueOf" ||
          s.name === "toLocaleString"
        )
          return undefined;

        return extract(s);
      });

      for (const element of arr) if (!element) return;

      console.log(`const schema = z.object({${arr.join(`,`)}})`);
    } catch (err) {
      console.log(err);
    }
  }

  node
    .getChildren(sourceFile)
    .forEach((child) => recursivelyGenerateSchema(child, sourceFile));
}

if (sourceFile) {
  recursivelyGenerateSchema(sourceFile, sourceFile);
} else {
  console.log(`no source file`);
}

// const schema = z.object({
//   age: z.number(),
//   name: z.string(),
//   test: z.string(),
//   test2: z.object({
//     agora: z.string(),
//     e: z.number(),
//     name: z.string(),
//     test: z.string(),
//   }),
// });
// const parsed = schema.parse(resolver(`123`));
// console.log(parsed);
