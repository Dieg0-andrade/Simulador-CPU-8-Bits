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
function fetch() {

  // 1. PC -> MAR
  const pc = getRegister("PC");
  setRegister("MAR", pc);

  // 2. RAM[MAR] -> MDR
  const memoryValue = Read(getRegister("MAR"));
  setRegister("MDR", memoryValue);

  // 3. MDR -> IR
  setRegister("IR", getRegister("MDR"));

  // 4. PC = PC + 1
  setRegister("PC", pc + 1);

  Logger.log("FETCH: PC -> MAR");
  Logger.log("FETCH: RAM[MAR] -> MDR");
  Logger.log("FETCH: MDR -> IR");
  Logger.log("FETCH: PC incrementado");

  return getRegister("IR");
}
function decode(instruction) {

  Logger.log("DECODE: Analizando instrucción " + instruction);

  const decoded = decodeInstruction(instruction);

  Logger.log("DECODE: Opcode = " + decoded.opcode);

  for (let i = 0; i < decoded.operands.length; i++) {
    Logger.log(
      "DECODE: Operando " + (i + 1) +
      " = " + decoded.operands[i] +
      " (" + decoded.operandTypes[i] + ")"
    );
  }

  return decoded;
}
function execute(decoded) {

  Logger.log("EXECUTE: Ejecutando " + decoded.opcode);

  const opcode = decoded.opcode;
  const operands = decoded.operands;

  let result = null;
  let destination = null;

  switch (opcode) {

    case "ADD":
      destination = operands[0];

      result = ADD(
        getRegister(operands[0]),
        getRegister(operands[1])
      );
      break;

    case "SUB":
      destination = operands[0];

      result = SUB(
        getRegister(operands[0]),
        getRegister(operands[1])
      );
      break;

    case "INC":
      destination = operands[0];
      result = INC(getRegister(operands[0]));
      break;

    case "DEC":
      destination = operands[0];
      result = DEC(getRegister(operands[0]));
      break;

    default:
      throw new Error(
        "Opcode todavía no implementado en Execute: " + opcode
      );
  }

  Logger.log("EXECUTE: Resultado = " + result);

  return {
    result: result,
    destination: destination
  };
}
function store(executionResult) {

  if (executionResult.destination === null) {
    Logger.log("STORE: No hay resultado para almacenar");
    return;
  }

  setRegister(
    executionResult.destination,
    executionResult.result
  );

  Logger.log(
    "STORE: " +
    executionResult.result +
    " almacenado en " +
    executionResult.destination
  );
}
