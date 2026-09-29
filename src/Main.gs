function testDecode() {

  resetCPU();

  const instruction = "MOV AX, 25";

  Logger.log("--- ANTES DEL DECODE ---");

  const decoded = decode(instruction);

  Logger.log("--- DESPUES DEL DECODE ---");
  Logger.log("Opcode identificado = " + decoded.opcode);
  Logger.log("Cantidad de operandos = " + decoded.operands.length);
}
