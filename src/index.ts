import * as ts from "typescript";
import { z } from "zod";
import { resolver } from "./target";

const filename = "src/target.ts";
const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename)!;
const typeChecker = program.getTypeChecker();

const extract = (s: ts.Symbol): any => {
  if ((s as any).type.intrinsicName)
    return `${s.escapedName}:z.${(s as any).type.intrinsicName}()`;

  if ((s as any).type.members.size == 1) {
    const key = Array.from((s as any).type.members.keys())[0];
    return extract((s as any).type.members.get(key));
  }

  let aux: any[] = [];
  for (const key of Array.from((s as any).type.members.keys())) {
    aux.push(extract((s as any).type.members.get(key)));
  }
  return `${s.escapedName}:z.object({${aux}})`;
};

function recursivelyPrintVariableDeclarations(
  node: ts.Node,
  sourceFile: ts.SourceFile
) {
  if (ts.isVariableDeclaration(node)) {
    const nodeText = node.getText(sourceFile);
    if (!nodeText.includes("resolver")) return;

    const type = typeChecker.getTypeAtLocation(node);

    const returned = type
      .getCallSignatures()[0]
      .getReturnType()
      .getProperties();

    const arr = returned.map((e) => extract(e));

    console.log(`const schema = z.object({${arr.join(`,`)}})`);
  }

  node
    .getChildren(sourceFile)
    .forEach((child) =>
      recursivelyPrintVariableDeclarations(child, sourceFile)
    );
}

if (sourceFile) {
  recursivelyPrintVariableDeclarations(sourceFile, sourceFile);
} else {
  console.log(`no source file`);
}

const schema = z.object({age:z.number(),name:z.string(),test:z.string(),test2:z.object({agora:z.string(),e:z.number(),name:z.string(),test:z.string()})})
const parsed  = schema.parse(resolver(`123`));
console.log(parsed)