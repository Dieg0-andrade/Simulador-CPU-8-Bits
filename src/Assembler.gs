function getDefaultDemoProgram() {

  return [
    "MOV AX, 0",
    "MOV BX, 5",
    "INC AX",
    "CMP AX, BX",
    "JNZ 04H",
    "STORE [80H], AX",
    "HLT"
  ];
}


function ensureProgramSheet() {

  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  let sheet =
    spreadsheet.getSheetByName("Programa");

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet("Programa");
  }

  sheet.getRange("A1").setValue("Programa");
  sheet.getRange("B1").setValue("Dirección");
  sheet.getRange("C1").setValue("Bytes");

  const lastRow =
    Math.max(sheet.getLastRow(), 2);

  const values =
    sheet
      .getRange(2, 1, lastRow - 1, 1)
      .getDisplayValues();

  const hasProgram =
    values.some(
      row => row[0].trim() !== ""
    );

  if (!hasProgram) {

    const program =
      getDefaultDemoProgram()
        .map(line => [line]);

    sheet
      .getRange(
        2,
        1,
        program.length,
        1
      )
      .setValues(program);
  }

  return sheet;
}


function parseByteLiteral(text, lineNumber) {

  const valueText =
    String(text)
      .trim()
      .toUpperCase();

  let value;


  if (/^\d+$/.test(valueText)) {

    value =
      parseInt(
        valueText,
        10
      );
  }

  else if (
    /^0X[0-9A-F]{1,2}$/.test(valueText)
  ) {

    value =
      parseInt(
        valueText.substring(2),
        16
      );
  }

  else if (
    /^[0-9A-F]{1,2}H$/.test(valueText)
  ) {

    value =
      parseInt(
        valueText.slice(0, -1),
        16
      );
  }

  else {

    throw new Error(
      "Línea " +
      lineNumber +
      ": valor inválido " +
      text
    );
  }


  if (
    value < 0 ||
    value > 255
  ) {

    throw new Error(
      "Línea " +
      lineNumber +
      ": valor fuera de 8 bits"
    );
  }

  return value;
}


function parseMemoryLiteral(
  text,
  lineNumber
) {

  const valueText =
    String(text)
      .trim()
      .toUpperCase();

  if (
    !valueText.startsWith("[") ||
    !valueText.endsWith("]")
  ) {

    throw new Error(
      "Línea " +
      lineNumber +
      ": dirección de memoria inválida"
    );
  }

  const inner =
    valueText.substring(
      1,
      valueText.length - 1
    );

  return parseByteLiteral(
    inner,
    lineNumber
  );
}


function isCPURegister(value) {

  return ["AX", "BX"]
    .includes(
      String(value)
        .trim()
        .toUpperCase()
    );
}


function requireOperandCount(
  operands,
  expected,
  lineNumber
) {

  if (
    operands.length !== expected
  ) {

    throw new Error(
      "Línea " +
      lineNumber +
      ": cantidad de operandos inválida"
    );
  }
}


function analyzeAssemblyForm(
  mnemonic,
  operands,
  lineNumber
) {

  switch (mnemonic) {

    case "HLT":

      requireOperandCount(
        operands,
        0,
        lineNumber
      );

      return {
        form: "NONE",
        operandByte: null
      };


    case "MOV": {

      requireOperandCount(
        operands,
        2,
        lineNumber
      );

      const destination =
        operands[0];

      const source =
        operands[1];

      if (
        !isCPURegister(destination)
      ) {

        throw new Error(
          "Línea " +
          lineNumber +
          ": registro destino inválido"
        );
      }

      if (
        isCPURegister(source)
      ) {

        if (
          destination === source
        ) {

          throw new Error(
            "Línea " +
            lineNumber +
            ": operación entre el mismo registro no está codificada"
          );
        }

        return {
          form:
            destination === "AX"
              ? "AX_BX"
              : "BX_AX",

          operandByte: null
        };
      }

      const immediate =
        parseByteLiteral(
          source,
          lineNumber
        );

      return {
        form:
          destination === "AX"
            ? "AX_IMM"
            : "BX_IMM",

        operandByte: immediate
      };
    }


    case "LOAD": {

      requireOperandCount(
        operands,
        2,
        lineNumber
      );

      const destination =
        operands[0];

      if (
        !isCPURegister(destination)
      ) {

        throw new Error(
          "Línea " +
          lineNumber +
          ": registro destino inválido"
        );
      }

      const address =
        parseMemoryLiteral(
          operands[1],
          lineNumber
        );

      return {
        form:
          destination === "AX"
            ? "AX_MEM"
            : "BX_MEM",

        operandByte: address
      };
    }


    case "STORE": {

      requireOperandCount(
        operands,
        2,
        lineNumber
      );

      const address =
        parseMemoryLiteral(
          operands[0],
          lineNumber
        );

      const source =
        operands[1];

      if (
        !isCPURegister(source)
      ) {

        throw new Error(
          "Línea " +
          lineNumber +
          ": registro fuente inválido"
        );
      }

      return {
        form:
          source === "AX"
            ? "MEM_AX"
            : "MEM_BX",

        operandByte: address
      };
    }


    case "ADD":
    case "SUB":
    case "CMP":
    case "AND":
    case "OR":
    case "XOR": {

      requireOperandCount(
        operands,
        2,
        lineNumber
      );

      const destination =
        operands[0];

      const source =
        operands[1];

      if (
        !isCPURegister(destination)
      ) {

        throw new Error(
          "Línea " +
          lineNumber +
          ": registro destino inválido"
        );
      }

      if (
        isCPURegister(source)
      ) {

        if (
          destination === source
        ) {

          throw new Error(
            "Línea " +
            lineNumber +
            ": operación entre el mismo registro no está codificada"
          );
        }

        return {
          form:
            destination === "AX"
              ? "AX_BX"
              : "BX_AX",

          operandByte: null
        };
      }

      const immediate =
        parseByteLiteral(
          source,
          lineNumber
        );

      return {
        form:
          destination === "AX"
            ? "AX_IMM"
            : "BX_IMM",

        operandByte: immediate
      };
    }


    case "INC":
    case "DEC":
    case "NOT": {

      requireOperandCount(
        operands,
        1,
        lineNumber
      );

      const register =
        operands[0];

      if (
        !isCPURegister(register)
      ) {

        throw new Error(
          "Línea " +
          lineNumber +
          ": registro inválido"
        );
      }

      return {
        form:
          register === "AX"
            ? "AX"
            : "BX",

        operandByte: null
      };
    }


    case "JMP":
    case "JZ":
    case "JNZ": {

      requireOperandCount(
        operands,
        1,
        lineNumber
      );

      const address =
        parseByteLiteral(
          operands[0],
          lineNumber
        );

      return {
        form: "ADDR",
        operandByte: address
      };
    }


    default:

      throw new Error(
        "Línea " +
        lineNumber +
        ": instrucción no válida " +
        mnemonic
      );
  }
}


function assembleInstruction(
  sourceLine,
  lineNumber
) {

  const cleanLine =
    String(sourceLine)
      .trim()
      .toUpperCase();

  if (
    cleanLine === ""
  ) {
    return null;
  }

  const firstSpace =
    cleanLine.indexOf(" ");

  let mnemonic;
  let operandsText;


  if (
    firstSpace === -1
  ) {

    mnemonic =
      cleanLine;

    operandsText =
      "";
  }

  else {

    mnemonic =
      cleanLine.substring(
        0,
        firstSpace
      );

    operandsText =
      cleanLine.substring(
        firstSpace + 1
      );
  }


  const operands =
    operandsText === ""
      ? []
      : operandsText
          .split(",")
          .map(
            operand =>
              operand.trim()
          );


  const analyzed =
    analyzeAssemblyForm(
      mnemonic,
      operands,
      lineNumber
    );


  const definition =
    getInstructionDefinitionByForm(
      mnemonic,
      analyzed.form
    );


  if (!definition) {

    throw new Error(
      "Línea " +
      lineNumber +
      ": combinación no implementada"
    );
  }


  const bytes = [
    definition.opcode
  ];


  if (
    definition.bytes === 2
  ) {

    bytes.push(
      analyzed.operandByte
    );
  }


  return {
    text: cleanLine,
    bytes: bytes,
    definition: definition
  };
}


function assembleProgramFromSheet() {

  const sheet =
    ensureProgramSheet();

  const lastRow =
    sheet.getLastRow();

  const source =
    sheet
      .getRange(
        2,
        1,
        Math.max(lastRow - 1, 1),
        1
      )
      .getDisplayValues();

  const programBytes = [];
  const instructions = [];

  let address = 0;


  for (
    let i = 0;
    i < source.length;
    i++
  ) {

    const sourceLine =
      source[i][0].trim();

    if (
      sourceLine === ""
    ) {
      continue;
    }

    const rowNumber =
      i + 2;

    const assembled =
      assembleInstruction(
        sourceLine,
        rowNumber
      );

    if (
      address +
      assembled.bytes.length >
      128
    ) {

      throw new Error(
        "El programa supera el segmento CODE"
      );
    }

    instructions.push({
      address: address,
      sourceRow: rowNumber,
      text: assembled.text,
      bytes: assembled.bytes
    });

    for (
      let j = 0;
      j < assembled.bytes.length;
      j++
    ) {

      programBytes.push(
        assembled.bytes[j]
      );

      address++;
    }
  }


  if (
    programBytes.length === 0
  ) {

    throw new Error(
      "La hoja Programa está vacía"
    );
  }


  sheet
    .getRange(
      2,
      2,
      Math.max(lastRow - 1, 1),
      2
    )
    .clearContent();


  instructions.forEach(
    instruction => {

      sheet
        .getRange(
          instruction.sourceRow,
          2
        )
        .setValue(
          formatHexByte(
            instruction.address
          ) + "H"
        );

      sheet
        .getRange(
          instruction.sourceRow,
          3
        )
        .setValue(
          instruction.bytes
            .map(formatHexByte)
            .join(" ")
        );
    }
  );


  return {
    bytes: programBytes,
    instructions: instructions
  };
}


function loadProgramIntoRAM(assembly) {

  clearRAM();

  for (
    let address = 0;
    address < assembly.bytes.length;
    address++
  ) {

    Write(
      address,
      assembly.bytes[address]
    );
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      "programLength",
      String(
        assembly.bytes.length
      )
    );

  refreshRAMMnemonicsFromMemory();
}


function refreshRAMMnemonicsFromMemory() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("RAM");

  if (!sheet) {
    return;
  }

  const programLength =
    Number(
      PropertiesService
        .getScriptProperties()
        .getProperty(
          "programLength"
        ) || 0
    );

  sheet
    .getRange("E1")
    .setValue("Mnemónico");

  const output =
    Array.from(
      { length: 128 },
      () => [""]
    );

  if (
    programLength === 0
  ) {

    sheet
      .getRange(
        2,
        5,
        128,
        1
      )
      .setValues(output);

    return;
  }


  const values =
    sheet
      .getRange(
        2,
        2,
        programLength,
        1
      )
      .getDisplayValues()
      .map(
        row =>
          parseInt(
            row[0] || "0",
            16
          )
      );


  let address = 0;


  while (
    address < programLength
  ) {

    const opcode =
      values[address];

    const definition =
      getInstructionDefinitionByOpcodeOrNull(
        opcode
      );

    if (!definition) {

      output[address][0] =
        "ERROR 0x" +
        formatHexByte(opcode);

      address++;

      continue;
    }

    let operandByte =
      null;

    if (
      definition.bytes === 2
    ) {

      if (
        address + 1 >=
        programLength
      ) {

        output[address][0] =
          "ERROR operando faltante";

        break;
      }

      operandByte =
        values[address + 1];
    }

    const decoded =
      decodeInstructionBytes(
        opcode,
        operandByte
      );

    output[address][0] =
      decoded.text;

    if (
      definition.bytes === 2
    ) {

      output[address + 1][0] =
        "↳ " +
        formatHexByte(
          operandByte
        ) +
        "H";
    }

    address +=
      definition.bytes;
  }


  sheet
    .getRange(
      2,
      5,
      128,
      1
    )
    .setValues(output);
}


function onEdit(e) {

  if (
    !e ||
    !e.range
  ) {
    return;
  }

  const range =
    e.range;

  const sheet =
    range.getSheet();

  if (
    sheet.getName() === "RAM" &&
    range.getColumn() === 2 &&
    range.getRow() >= 2 &&
    range.getRow() <= 129
  ) {

    refreshRAMMnemonicsFromMemory();
  }
}
