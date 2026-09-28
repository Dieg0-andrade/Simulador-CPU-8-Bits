function testDecoder() {

  const decoded = decodeInstruction("LOAD AX, [80h]");

  Logger.log("Opcode = " + decoded.opcode);
  Logger.log("Operando 1 = " + decoded.operands[0]);
  Logger.log("Tipo 1 = " + decoded.operandTypes[0]);

  Logger.log("Operando 2 = " + decoded.operands[1]);
  Logger.log("Tipo 2 = " + decoded.operandTypes[1]);
}
