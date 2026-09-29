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

  // Dirección de memoria: [80H], [A0H], etc.
  if (/^\[[0-9A-F]{1,2}H\]$/.test(operand)) {
    return "MEMORY";
  }

  // Valor inmediato decimal: 10, 25, 255...
  if (/^\d+$/.test(operand)) {
    return "IMMEDIATE";
  }
  // Dirección para saltos: 10H, 20H, FFH...
  if (/^[0-9A-F]{1,2}H$/.test(operand)) {
  return "ADDRESS";
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


// Convierte una dirección como [80H] a decimal
function parseMemoryAddress(operand) {

  if (!/^\[[0-9A-F]{1,2}H\]$/.test(operand)) {
    throw new Error("Dirección de memoria inválida: " + operand);
  }

  const hexValue = operand
    .replace("[", "")
    .replace("]", "")
    .replace("H", "");

  return parseInt(hexValue, 16);
}

function parseJumpAddress(operand) {

  if (!/^[0-9A-F]{1,2}H$/.test(operand)) {
    throw new Error("Dirección de salto inválida: " + operand);
  }

  const hexValue = operand.replace("H", "");

  return parseInt(hexValue, 16);
}

function execute(decoded) {

  Logger.log("EXECUTE: Ejecutando " + decoded.opcode);

  const opcode = decoded.opcode;
  const operands = decoded.operands;

  let result = null;
  let destination = null;
  let memoryAddress = null;

  switch (opcode) {

    case "MOV":

      destination = operands[0];

      if (decoded.operandTypes[1] === "IMMEDIATE") {
        result = parseInt(operands[1]);
      }

      else if (decoded.operandTypes[1] === "REGISTER") {
        result = getRegister(operands[1]);
      }

      else {
        throw new Error("Operando inválido para MOV");
      }

      break;


    case "LOAD":

      destination = operands[0];

      memoryAddress = parseMemoryAddress(operands[1]);

      result = Read(memoryAddress);

      break;


    case "STORE":

      memoryAddress = parseMemoryAddress(operands[0]);

      result = getRegister(operands[1]);

      destination = "MEMORY";

      break;


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


    case "CMP":

      CMP(
        getRegister(operands[0]),
        getRegister(operands[1])
      );

      Logger.log("EXECUTE: Comparación realizada");

      return {
        result: null,
        destination: null,
        memoryAddress: null
      };
        case "JMP":

      const jumpAddress = parseJumpAddress(operands[0]);

      setRegister("PC", jumpAddress);

      Logger.log("EXECUTE: Salto incondicional a " + operands[0]);

      return {
        result: null,
        destination: null,
        memoryAddress: null
      };


    case "JZ":

      const jzAddress = parseJumpAddress(operands[0]);

      if (getFlag("ZF") === 1) {

        setRegister("PC", jzAddress);

        Logger.log("EXECUTE: JZ realizado, PC = " + jzAddress);

      } else {

        Logger.log("EXECUTE: JZ no realizado porque ZF = 0");
      }

      return {
        result: null,
        destination: null,
        memoryAddress: null
      };


    case "JNZ":

      const jnzAddress = parseJumpAddress(operands[0]);

      if (getFlag("ZF") === 0) {

        setRegister("PC", jnzAddress);

        Logger.log("EXECUTE: JNZ realizado, PC = " + jnzAddress);

      } else {

        Logger.log("EXECUTE: JNZ no realizado porque ZF = 1");
      }

      return {
        result: null,
        destination: null,
        memoryAddress: null
      };


    case "HLT":

      Logger.log("EXECUTE: CPU detenida");

      return {
        result: null,
        destination: null,
        memoryAddress: null,
        halted: true
      };


    default:

      throw new Error(
        "Opcode todavía no implementado en Execute: " + opcode
      );
  }

  Logger.log("EXECUTE: Resultado = " + result);

  return {
    result: result,
    destination: destination,
    memoryAddress: memoryAddress
  };
}


function store(executionResult) {

  if (executionResult.destination === null) {
    Logger.log("STORE: No hay resultado para almacenar");
    return;
  }

  // Guardar en memoria
  if (executionResult.destination === "MEMORY") {

    Write(
      executionResult.memoryAddress,
      executionResult.result
    );

    Logger.log(
      "STORE: " +
      executionResult.result +
      " almacenado en RAM[" +
      executionResult.memoryAddress +
      "]"
    );

    return;
  }

  // Guardar en registro
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
