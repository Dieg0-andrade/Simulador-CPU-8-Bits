function decodeInstruction(instruction) {

  if (typeof instruction !== "string" || instruction.trim() === "") {
    throw new Error("Instrucción inválida");
  }

  const cleanInstruction = instruction.trim().toUpperCase();

  const parts = cleanInstruction.split(/\s+/);

  const opcode = parts[0];

  const validOpcodes = [
    "MOV",
    "LOAD",
    "STORE",
    "ADD",
    "SUB",
    "INC",
    "DEC",
    "CMP",
    "JMP",
    "JZ",
    "JNZ",
    "HLT"
  ];

  if (!validOpcodes.includes(opcode)) {
    throw new Error("Opcode no válido: " + opcode);
  }

  const operandsText = parts.slice(1).join(" ");

  const operands = operandsText
    ? operandsText.split(",").map(op => op.trim())
    : [];

  return {
  opcode: opcode,
  operands: operands,
  operandTypes: operands.map(op => detectOperandType(op))
};
}
function detectOperandType(operand) {

  // Registro
  if (["AX", "BX"].includes(operand)) {
    return "REGISTER";
  }

  // Dirección de memoria: [80h], [A0h], etc.
  if (/^\[[0-9A-F]{1,2}H\]$/.test(operand)) {
    return "MEMORY";
  }

  // Valor inmediato decimal: 10, 25, 255...
  if (/^\d+$/.test(operand)) {
    return "IMMEDIATE";
  }

  return "UNKNOWN";
}
