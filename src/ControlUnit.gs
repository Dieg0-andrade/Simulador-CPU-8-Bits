function decodeInstruction(instruction) {

  if (
    typeof instruction !== "string" ||
    instruction.trim() === ""
  ) {

    throw new Error(
      "Instrucción inválida"
    );
  }


  const cleanInstruction =
    instruction
      .trim()
      .toUpperCase();


  const parts =
    cleanInstruction
      .split(/\s+/);


  const opcode =
    parts[0];


  const validOpcodes = [
    "MOV",
    "LOAD",
    "STORE",
    "ADD",
    "SUB",
    "INC",
    "DEC",
    "CMP",
    "AND",
    "OR",
    "XOR",
    "NOT",
    "JMP",
    "JZ",
    "JNZ",
    "HLT"
  ];


  if (
    !validOpcodes.includes(
      opcode
    )
  ) {

    throw new Error(
      "Opcode no válido: " +
      opcode
    );
  }


  const operandsText =
    parts
      .slice(1)
      .join(" ");


  const operands =
    operandsText
      ? operandsText
          .split(",")
          .map(
            operand =>
              operand.trim()
          )
      : [];


  return {
    opcode: opcode,
    operands: operands,
    operandTypes:
      operands.map(
        operand =>
          detectOperandType(
            operand
          )
      )
  };
}


function detectOperandType(
  operand
) {

  const value =
    String(operand)
      .trim()
      .toUpperCase();


  if (
    ["AX", "BX"]
      .includes(value)
  ) {

    return "REGISTER";
  }


  if (
    /^\[[0-9A-F]{1,2}H\]$/
      .test(value)
  ) {

    return "MEMORY";
  }


  if (
    /^\d+$/
      .test(value)
  ) {

    return "IMMEDIATE";
  }


  if (
    /^0X[0-9A-F]{1,2}$/
      .test(value)
  ) {

    return "IMMEDIATE";
  }


  if (
    /^[0-9A-F]{1,2}H$/
      .test(value)
  ) {

    return "IMMEDIATE";
  }


  return "UNKNOWN";
}


function parseImmediateValue(
  operand
) {

  const valueText =
    String(operand)
      .trim()
      .toUpperCase();


  let value;


  if (
    /^\d+$/
      .test(valueText)
  ) {

    value =
      parseInt(
        valueText,
        10
      );
  }

  else if (
    /^0X[0-9A-F]{1,2}$/
      .test(valueText)
  ) {

    value =
      parseInt(
        valueText.substring(2),
        16
      );
  }

  else if (
    /^[0-9A-F]{1,2}H$/
      .test(valueText)
  ) {

    value =
      parseInt(
        valueText.slice(
          0,
          -1
        ),
        16
      );
  }

  else {

    throw new Error(
      "Valor inmediato inválido: " +
      operand
    );
  }


  if (
    value < 0 ||
    value > 255
  ) {

    throw new Error(
      "Valor inmediato fuera de 8 bits: " +
      operand
    );
  }


  return value;
}


function resolveOperandValue(
  operand,
  operandType
) {

  if (
    operandType ===
    "REGISTER"
  ) {

    return getRegister(
      operand
    );
  }


  if (
    operandType ===
    "IMMEDIATE"
  ) {

    return parseImmediateValue(
      operand
    );
  }


  throw new Error(
    "Operando no válido: " +
    operand
  );
}


function incrementPC() {

  const currentPC =
    getRegister("PC");


  const nextPC =
    (currentPC + 1) &
    0xFF;


  setRegister(
    "PC",
    nextPC
  );


  return nextPC;
}


function fetch() {

  const pc =
    getRegister("PC");


  setRegister(
    "MAR",
    pc
  );


  const memoryValue =
    Read(
      getRegister("MAR")
    );


  setRegister(
    "MDR",
    memoryValue
  );


  setRegister(
    "IR",
    getRegister("MDR")
  );


  incrementPC();


  Logger.log(
    "FETCH: MAR = " +
    formatHexByte(pc) +
    "H"
  );


  Logger.log(
    "FETCH: MDR = " +
    formatHexByte(
      memoryValue
    ) +
    "H"
  );


  Logger.log(
    "FETCH: IR = " +
    formatHexByte(
      getRegister("IR")
    ) +
    "H"
  );


  return getRegister("IR");
}


function fetchOperandByte() {

  const pc =
    getRegister("PC");


  setRegister(
    "MAR",
    pc
  );


  const value =
    Read(
      getRegister("MAR")
    );


  setRegister(
    "MDR",
    value
  );


  incrementPC();


  Logger.log(
    "FETCH OPERANDO: MAR = " +
    formatHexByte(pc) +
    "H"
  );


  Logger.log(
    "FETCH OPERANDO: MDR = " +
    formatHexByte(value) +
    "H"
  );


  return value;
}


function decode(
  instruction
) {

  Logger.log(
    "DECODE: Analizando instrucción " +
    instruction
  );


  const decoded =
    decodeInstruction(
      instruction
    );


  Logger.log(
    "DECODE: Opcode = " +
    decoded.opcode
  );


  for (
    let i = 0;
    i <
    decoded.operands.length;
    i++
  ) {

    Logger.log(
      "DECODE: Operando " +
      (i + 1) +
      " = " +
      decoded.operands[i] +
      " (" +
      decoded.operandTypes[i] +
      ")"
    );
  }


  return decoded;
}


function parseMemoryAddress(
  operand
) {

  if (
    !/^\[[0-9A-F]{1,2}H\]$/
      .test(operand)
  ) {

    throw new Error(
      "Dirección de memoria inválida: " +
      operand
    );
  }


  const hexValue =
    operand
      .replace("[", "")
      .replace("]", "")
      .replace("H", "");


  return parseInt(
    hexValue,
    16
  );
}


function parseJumpAddress(
  operand
) {

  const value =
    String(operand)
      .trim()
      .toUpperCase();


  if (
    !/^[0-9A-F]{1,2}H$/
      .test(value)
  ) {

    throw new Error(
      "Dirección de salto inválida: " +
      operand
    );
  }


  return parseInt(
    value.slice(
      0,
      -1
    ),
    16
  );
}


function execute(decoded) {

  Logger.log(
    "EXECUTE: Ejecutando " +
    decoded.opcode
  );


  const opcode =
    decoded.opcode;


  const operands =
    decoded.operands;


  let result = null;
  let destination = null;
  let memoryAddress = null;


  switch (opcode) {

    case "MOV":

      destination =
        operands[0];


      result =
        resolveOperandValue(
          operands[1],
          decoded
            .operandTypes[1]
        );


      break;


    case "LOAD": {

      destination =
        operands[0];


      memoryAddress =
        parseMemoryAddress(
          operands[1]
        );


      setRegister(
        "MAR",
        memoryAddress
      );


      const memoryValue =
        Read(
          getRegister("MAR")
        );


      setRegister(
        "MDR",
        memoryValue
      );


      result =
        getRegister("MDR");


      Logger.log(
        "EXECUTE LOAD: MAR = " +
        formatHexByte(
          getRegister("MAR")
        ) +
        "H"
      );


      Logger.log(
        "EXECUTE LOAD: RAM[MAR] -> MDR = " +
        formatHexByte(
          getRegister("MDR")
        ) +
        "H"
      );


      break;
    }


    case "STORE": {

      memoryAddress =
        parseMemoryAddress(
          operands[0]
        );


      setRegister(
        "MAR",
        memoryAddress
      );


      setRegister(
        "MDR",
        getRegister(
          operands[1]
        )
      );


      result =
        getRegister("MDR");


      destination =
        "MEMORY";


      Logger.log(
        "EXECUTE STORE: MAR = " +
        formatHexByte(
          getRegister("MAR")
        ) +
        "H"
      );


      Logger.log(
        "EXECUTE STORE: " +
        operands[1] +
        " -> MDR = " +
        formatHexByte(
          getRegister("MDR")
        ) +
        "H"
      );


      break;
    }


    case "ADD":

      destination =
        operands[0];


      result =
        ADD(
          getRegister(
            operands[0]
          ),
          resolveOperandValue(
            operands[1],
            decoded
              .operandTypes[1]
          )
        );


      break;


    case "SUB":

      destination =
        operands[0];


      result =
        SUB(
          getRegister(
            operands[0]
          ),
          resolveOperandValue(
            operands[1],
            decoded
              .operandTypes[1]
          )
        );


      break;


    case "INC":

      destination =
        operands[0];


      result =
        INC(
          getRegister(
            operands[0]
          )
        );


      break;


    case "DEC":

      destination =
        operands[0];


      result =
        DEC(
          getRegister(
            operands[0]
          )
        );


      break;


    case "CMP":

      CMP(
        getRegister(
          operands[0]
        ),
        resolveOperandValue(
          operands[1],
          decoded
            .operandTypes[1]
        )
      );


      return {
        result: null,
        destination: null,
        memoryAddress: null
      };


    case "AND":

      destination =
        operands[0];


      result =
        AND(
          getRegister(
            operands[0]
          ),
          resolveOperandValue(
            operands[1],
            decoded
              .operandTypes[1]
          )
        );


      break;


    case "OR":

      destination =
        operands[0];


      result =
        OR(
          getRegister(
            operands[0]
          ),
          resolveOperandValue(
            operands[1],
            decoded
              .operandTypes[1]
          )
        );


      break;


    case "XOR":

      destination =
        operands[0];


      result =
        XOR(
          getRegister(
            operands[0]
          ),
          resolveOperandValue(
            operands[1],
            decoded
              .operandTypes[1]
          )
        );


      break;


    case "NOT":

      destination =
        operands[0];


      result =
        NOT(
          getRegister(
            operands[0]
          )
        );


      break;


    case "JMP": {

      const jumpAddress =
        parseJumpAddress(
          operands[0]
        );


      setRegister(
        "PC",
        jumpAddress
      );


      return {
        result: null,
        destination: null,
        memoryAddress: null
      };
    }


    case "JZ": {

      const jzAddress =
        parseJumpAddress(
          operands[0]
        );


      if (
        getFlag("ZF") === 1
      ) {

        setRegister(
          "PC",
          jzAddress
        );
      }


      return {
        result: null,
        destination: null,
        memoryAddress: null
      };
    }


    case "JNZ": {

      const jnzAddress =
        parseJumpAddress(
          operands[0]
        );


      if (
        getFlag("ZF") === 0
      ) {

        setRegister(
          "PC",
          jnzAddress
        );
      }


      return {
        result: null,
        destination: null,
        memoryAddress: null
      };
    }


    case "HLT":

      return {
        result: null,
        destination: null,
        memoryAddress: null,
        halted: true
      };


    default:

      throw new Error(
        "Opcode todavía no implementado: " +
        opcode
      );
  }


  Logger.log(
    "EXECUTE: Resultado = " +
    result
  );


  return {
    result: result,
    destination: destination,
    memoryAddress: memoryAddress
  };
}


function store(
  executionResult
) {

  if (
    executionResult.destination ===
    null
  ) {

    Logger.log(
      "STORE: No hay resultado para almacenar"
    );

    return;
  }


  if (
    executionResult.destination ===
    "MEMORY"
  ) {

    Write(
      getRegister("MAR"),
      getRegister("MDR")
    );


    Logger.log(
      "STORE: MDR = " +
      formatHexByte(
        getRegister("MDR")
      ) +
      "H -> RAM[" +
      formatHexByte(
        getRegister("MAR")
      ) +
      "H]"
    );


    return;
  }


  setRegister(
    executionResult.destination,
    executionResult.result
  );


  Logger.log(
    "STORE: MDR/resultado = " +
    executionResult.result +
    " almacenado en " +
    executionResult.destination
  );
}
