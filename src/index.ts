import * as ts from "typescript";

const filename = "src/target.ts";
const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename)!;
const typeChecker = program.getTypeChecker();

function recursivelyPrintVariableDeclarations(
  node: ts.Node,
  sourceFile: ts.SourceFile
) {
  if (ts.isVariableDeclaration(node)) {
    const nodeText = node.getText(sourceFile);
    if (!nodeText.includes("resolver")) return;

    const type = typeChecker.getTypeAtLocation(node);
    const typeName = typeChecker.typeToString(type, node);

    console.log(nodeText);
    console.log(`(${typeName})`);

    const returned = type
      .getCallSignatures()[0]
      .getReturnType()
      .getProperties();

    const arr = returned.map(
      (e) => `${e.escapedName}: z.${(e as any).type.intrinsicName}()`
    );

    console.log(`const schema = { ${arr.join(`, `)} }`);

    // returned[0] as any).type.intrinsicName
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
