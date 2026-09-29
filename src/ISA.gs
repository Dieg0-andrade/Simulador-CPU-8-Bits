const ISA_TABLE = [

  {
    opcode: 0x00,
    mnemonic: "HLT",
    form: "NONE",
    bytes: 1,
    flags: "-",
    description: "Detiene la CPU"
  },

  {
    opcode: 0x10,
    mnemonic: "MOV",
    form: "AX_IMM",
    bytes: 2,
    flags: "-",
    description: "Carga un valor inmediato en AX"
  },

  {
    opcode: 0x11,
    mnemonic: "MOV",
    form: "BX_IMM",
    bytes: 2,
    flags: "-",
    description: "Carga un valor inmediato en BX"
  },

  {
    opcode: 0x12,
    mnemonic: "MOV",
    form: "AX_BX",
    bytes: 1,
    flags: "-",
    description: "Copia BX en AX"
  },

  {
    opcode: 0x13,
    mnemonic: "MOV",
    form: "BX_AX",
    bytes: 1,
    flags: "-",
    description: "Copia AX en BX"
  },

  {
    opcode: 0x20,
    mnemonic: "LOAD",
    form: "AX_MEM",
    bytes: 2,
    flags: "-",
    description: "Carga RAM[dir] en AX"
  },

  {
    opcode: 0x21,
    mnemonic: "LOAD",
    form: "BX_MEM",
    bytes: 2,
    flags: "-",
    description: "Carga RAM[dir] en BX"
  },

  {
    opcode: 0x22,
    mnemonic: "STORE",
    form: "MEM_AX",
    bytes: 2,
    flags: "-",
    description: "Guarda AX en RAM[dir]"
  },

  {
    opcode: 0x23,
    mnemonic: "STORE",
    form: "MEM_BX",
    bytes: 2,
    flags: "-",
    description: "Guarda BX en RAM[dir]"
  },

  {
    opcode: 0x32,
    mnemonic: "ADD",
    form: "AX_BX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "AX = AX + BX"
  },

  {
    opcode: 0x33,
    mnemonic: "ADD",
    form: "BX_AX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "BX = BX + AX"
  },

  {
    opcode: 0x36,
    mnemonic: "SUB",
    form: "AX_BX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "AX = AX - BX"
  },

  {
    opcode: 0x37,
    mnemonic: "SUB",
    form: "BX_AX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "BX = BX - AX"
  },

  {
    opcode: 0x42,
    mnemonic: "CMP",
    form: "AX_BX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "Compara AX con BX"
  },

  {
    opcode: 0x43,
    mnemonic: "CMP",
    form: "BX_AX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "Compara BX con AX"
  },

  {
    opcode: 0x50,
    mnemonic: "INC",
    form: "AX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "Incrementa AX"
  },

  {
    opcode: 0x51,
    mnemonic: "INC",
    form: "BX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "Incrementa BX"
  },

  {
    opcode: 0x52,
    mnemonic: "DEC",
    form: "AX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "Decrementa AX"
  },

  {
    opcode: 0x53,
    mnemonic: "DEC",
    form: "BX",
    bytes: 1,
    flags: "ZF CF SF",
    description: "Decrementa BX"
  },

  {
    opcode: 0x60,
    mnemonic: "JMP",
    form: "ADDR",
    bytes: 2,
    flags: "-",
    description: "Salto incondicional"
  },

  {
    opcode: 0x61,
    mnemonic: "JZ",
    form: "ADDR",
    bytes: 2,
    flags: "-",
    description: "Salta si ZF es 1"
  },

  {
    opcode: 0x62,
    mnemonic: "JNZ",
    form: "ADDR",
    bytes: 2,
    flags: "-",
    description: "Salta si ZF es 0"
  }

];


function formatHexByte(value) {

  return Number(value)
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");
}


function getInstructionDefinitionByOpcode(opcode) {

  const definition = ISA_TABLE.find(
    item => item.opcode === opcode
  );

  if (!definition) {
    throw new Error(
      "Opcode inválido 0x" + formatHexByte(opcode)
    );
  }

  return definition;
}


function getInstructionDefinitionByOpcodeOrNull(opcode) {

  return ISA_TABLE.find(
    item => item.opcode === opcode
  ) || null;
}


function getInstructionDefinitionByForm(mnemonic, form) {

  const definition = ISA_TABLE.find(
    item =>
      item.mnemonic === mnemonic &&
      item.form === form
  );

  return definition || null;
}


function decodeInstructionBytes(opcode, operandByte) {

  const definition =
    getInstructionDefinitionByOpcode(opcode);

  const mnemonic = definition.mnemonic;

  let operands = [];
  let operandTypes = [];
  let text = mnemonic;


  switch (definition.form) {

    case "NONE":

      break;


    case "AX_IMM":

      operands = [
        "AX",
        String(operandByte)
      ];

      operandTypes = [
        "REGISTER",
        "IMMEDIATE"
      ];

      text =
        mnemonic +
        " AX, " +
        operandByte;

      break;


    case "BX_IMM":

      operands = [
        "BX",
        String(operandByte)
      ];

      operandTypes = [
        "REGISTER",
        "IMMEDIATE"
      ];

      text =
        mnemonic +
        " BX, " +
        operandByte;

      break;


    case "AX_BX":

      operands = [
        "AX",
        "BX"
      ];

      operandTypes = [
        "REGISTER",
        "REGISTER"
      ];

      text =
        mnemonic +
        " AX, BX";

      break;


    case "BX_AX":

      operands = [
        "BX",
        "AX"
      ];

      operandTypes = [
        "REGISTER",
        "REGISTER"
      ];

      text =
        mnemonic +
        " BX, AX";

      break;


    case "AX_MEM":

      operands = [
        "AX",
        "[" + formatHexByte(operandByte) + "H]"
      ];

      operandTypes = [
        "REGISTER",
        "MEMORY"
      ];

      text =
        mnemonic +
        " AX, [" +
        formatHexByte(operandByte) +
        "H]";

      break;


    case "BX_MEM":

      operands = [
        "BX",
        "[" + formatHexByte(operandByte) + "H]"
      ];

      operandTypes = [
        "REGISTER",
        "MEMORY"
      ];

      text =
        mnemonic +
        " BX, [" +
        formatHexByte(operandByte) +
        "H]";

      break;


    case "MEM_AX":

      operands = [
        "[" + formatHexByte(operandByte) + "H]",
        "AX"
      ];

      operandTypes = [
        "MEMORY",
        "REGISTER"
      ];

      text =
        mnemonic +
        " [" +
        formatHexByte(operandByte) +
        "H], AX";

      break;


    case "MEM_BX":

      operands = [
        "[" + formatHexByte(operandByte) + "H]",
        "BX"
      ];

      operandTypes = [
        "MEMORY",
        "REGISTER"
      ];

      text =
        mnemonic +
        " [" +
        formatHexByte(operandByte) +
        "H], BX";

      break;


    case "AX":

      operands = ["AX"];

      operandTypes = ["REGISTER"];

      text =
        mnemonic +
        " AX";

      break;


    case "BX":

      operands = ["BX"];

      operandTypes = ["REGISTER"];

      text =
        mnemonic +
        " BX";

      break;


    case "ADDR":

      operands = [
        formatHexByte(operandByte) + "H"
      ];

      operandTypes = [
        "ADDRESS"
      ];

      text =
        mnemonic +
        " " +
        formatHexByte(operandByte) +
        "H";

      break;


    default:

      throw new Error(
        "Formato ISA no soportado: " +
        definition.form
      );
  }


  return {

    opcode: mnemonic,

    operands: operands,

    operandTypes: operandTypes,

    opcodeByte: opcode,

    operandByte: operandByte,

    bytes: definition.bytes,

    text: text
  };
}
