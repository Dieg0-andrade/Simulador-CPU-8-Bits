function updateCPUInterface() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");


  if (!sheet) {

    throw new Error(
      "No existe la hoja CPU"
    );
  }


  const registers = [
    "PC",
    "IR",
    "MAR",
    "MDR",
    "AX",
    "BX"
  ];


  for (
    let i = 0;
    i < registers.length;
    i++
  ) {

    const register =
      registers[i];

    const value =
      getRegister(register);


    const hexValue =
      value
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");


    sheet
      .getRange(
        i + 2,
        1
      )
      .setValue(register);


    sheet
      .getRange(
        i + 2,
        2
      )
      .setNumberFormat("@")
      .setValue(hexValue);
  }
}


function updateFlagsInterface() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");


  if (!sheet) {

    throw new Error(
      "No existe la hoja CPU"
    );
  }


  const flags = [
    "ZF",
    "CF",
    "SF"
  ];


  for (
    let i = 0;
    i < flags.length;
    i++
  ) {

    const flag =
      flags[i];


    sheet
      .getRange(
        i + 2,
        4
      )
      .setValue(flag);


    sheet
      .getRange(
        i + 2,
        5
      )
      .setValue(
        getFlag(flag)
      );
  }
}


const phases = [
  "FETCH",
  "DECODE",
  "EXECUTE",
  "STORE"
];


function updateCPUStatus(
  phase,
  status,
  instruction,
  operation
) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");


  if (!sheet) {

    throw new Error(
      "No existe la hoja CPU"
    );
  }


  if (phase !== null) {

    sheet
      .getRange("E8")
      .setValue(phase);
  }


  if (status !== null) {

    sheet
      .getRange("E9")
      .setValue(status);
  }


  if (instruction !== null) {

    sheet
      .getRange("E10")
      .setValue(instruction);
  }


  if (operation !== null) {

    sheet
      .getRange("E11")
      .setValue(operation);
  }
}


function highlightPhase(phase) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");


  const cell =
    sheet.getRange("E8");


  switch (phase) {

    case "FETCH":

      cell.setBackground(
        "#D9EAD3"
      );

      break;


    case "DECODE":

      cell.setBackground(
        "#FFF2CC"
      );

      break;


    case "EXECUTE":

      cell.setBackground(
        "#F4CCCC"
      );

      break;


    case "STORE":

      cell.setBackground(
        "#D9D2E9"
      );

      break;


    default:

      cell.setBackground(
        "#FFFFFF"
      );
  }


  cell.setFontWeight(
    "bold"
  );
}


function addLog(
  phase,
  operation
) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");


  let row =
    24;


  while (
    sheet
      .getRange(row, 3)
      .getValue() !== ""
  ) {

    row++;
  }


  const now =
    new Date();


  sheet
    .getRange(row, 3)
    .setValue(now);


  sheet
    .getRange(row, 3)
    .setNumberFormat(
      "HH:mm:ss"
    );


  sheet
    .getRange(row, 4)
    .setValue(phase);


  sheet
    .getRange(row, 5)
    .setValue(operation);
}


function stepCPU() {

  const properties =
    PropertiesService
      .getScriptProperties();


  let currentPhase =
    Number(
      properties
        .getProperty(
          "currentPhase"
        ) || 0
    );


  const phase =
    phases[currentPhase];


  let instruction =
    properties
      .getProperty(
        "currentInstruction"
      ) || "";


  let operation =
    "";


  switch (phase) {

    case "FETCH": {

      const fetchAddress =
        getRegister("PC");


      const opcodeByte =
        fetch();


      const definition =
        getInstructionDefinitionByOpcode(
          opcodeByte
        );


      instruction =
        definition.mnemonic;


      properties.setProperty(
        "currentOpcode",
        String(opcodeByte)
      );


      properties.setProperty(
        "currentInstruction",
        instruction
      );


      properties.deleteProperty(
        "decodedInstruction"
      );


      properties.deleteProperty(
        "executionResult"
      );


      operation =
        "MAR=" +
        formatHexByte(fetchAddress) +
        "H, MDR=" +
        formatHexByte(opcodeByte) +
        "H -> IR=" +
        formatHexByte(opcodeByte) +
        "H, PC=" +
        formatHexByte(
          getRegister("PC")
        ) +
        "H";


      break;
    }


    case "DECODE": {

      const opcodeText =
        properties
          .getProperty(
            "currentOpcode"
          );


      if (
        opcodeText === null
      ) {

        throw new Error(
          "No existe opcode para decodificar"
        );
      }


      const opcodeByte =
        Number(opcodeText);


      const definition =
        getInstructionDefinitionByOpcode(
          opcodeByte
        );


      let operandByte =
        null;


      let operandAddress =
        null;


      if (
        definition.bytes === 2
      ) {

        operandAddress =
          getRegister("PC");


        operandByte =
          fetchOperandByte();
      }


      const decoded =
        decodeInstructionBytes(
          opcodeByte,
          operandByte
        );


      instruction =
        decoded.text;


      properties.setProperty(
        "currentInstruction",
        instruction
      );


      properties.setProperty(
        "decodedInstruction",
        JSON.stringify(decoded)
      );


      if (
        definition.bytes === 2
      ) {

        operation =
          "MAR=" +
          formatHexByte(
            operandAddress
          ) +
          "H, MDR=" +
          formatHexByte(
            operandByte
          ) +
          "H -> " +
          instruction;

      }

      else {

        operation =
          "IR=" +
          formatHexByte(
            opcodeByte
          ) +
          "H -> " +
          instruction;
      }


      break;
    }


    case "EXECUTE": {

      const decodedText =
        properties
          .getProperty(
            "decodedInstruction"
          );


      if (!decodedText) {

        throw new Error(
          "No existe instrucción decodificada"
        );
      }


      const decoded =
        JSON.parse(
          decodedText
        );


      const execution =
        execute(decoded);


      properties.setProperty(
        "executionResult",
        JSON.stringify(
          execution
        )
      );


      operation =
        "Ejecutando: " +
        instruction;


      break;
    }


    case "STORE": {

      const executionText =
        properties
          .getProperty(
            "executionResult"
          );


      if (!executionText) {

        throw new Error(
          "No existe resultado de ejecución"
        );
      }


      const execution =
        JSON.parse(
          executionText
        );


      store(execution);


      operation =
        "STORE completado: " +
        instruction;


      if (
        execution.halted === true
      ) {

        updateCPUStatus(
          "STORE",
          "HALTED",
          instruction,
          "CPU detenida por HLT"
        );


        highlightPhase(
          "STORE"
        );


        addLog(
          "STORE",
          "CPU detenida por HLT"
        );


        updateCPUInterface();

        updateFlagsInterface();


        properties.setProperty(
          "currentPhase",
          "0"
        );


        properties.setProperty(
          "runState",
          "HALTED"
        );


        return "HLT";
      }


      break;
    }
  }


  updateCPUStatus(
    phase,
    "RUNNING",
    instruction,
    operation
  );


  highlightPhase(
    phase
  );


  addLog(
    phase,
    operation
  );


  updateCPUInterface();

  updateFlagsInterface();


  currentPhase++;


  if (
    currentPhase >=
    phases.length
  ) {

    currentPhase =
      0;
  }


  properties.setProperty(
    "currentPhase",
    String(currentPhase)
  );


  return phase;
}


function runCPU() {

  const properties =
    PropertiesService
      .getScriptProperties();


  properties.setProperty(
    "runState",
    "RUNNING"
  );


  updateCPUStatus(
    null,
    "RUNNING",
    null,
    null
  );


  for (
    let i = 0;
    i < 100;
    i++
  ) {

    const runState =
      properties
        .getProperty(
          "runState"
        );


    if (
      runState === "PAUSED"
    ) {

      updateCPUStatus(
        null,
        "PAUSED",
        null,
        "Ejecución pausada"
      );

      return;
    }


    const phase =
      stepCPU();


    if (
      phase === "HLT"
    ) {

      properties.setProperty(
        "runState",
        "HALTED"
      );

      return;
    }


    Utilities.sleep(
      500
    );
  }


  properties.setProperty(
    "runState",
    "STOPPED"
  );
}


function pauseCPU() {

  const properties =
    PropertiesService
      .getScriptProperties();


  properties.setProperty(
    "runState",
    "PAUSED"
  );


  updateCPUStatus(
    null,
    "PAUSED",
    null,
    "Ejecución pausada"
  );
}


function resetSimulator() {

  resetCPU();


  const properties =
    PropertiesService
      .getScriptProperties();


  properties.setProperty(
    "currentPhase",
    "0"
  );


  properties.setProperty(
    "runState",
    "STOPPED"
  );


  properties.deleteProperty(
    "currentInstruction"
  );


  properties.deleteProperty(
    "currentOpcode"
  );


  properties.deleteProperty(
    "decodedInstruction"
  );


  properties.deleteProperty(
    "executionResult"
  );


  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");


  sheet
    .getRange(
      "C24:E200"
    )
    .clearContent();


  updateCPUStatus(
    "FETCH",
    "READY",
    "",
    ""
  );


  sheet
    .getRange("E8")
    .setBackground(
      "#FFFFFF"
    )
    .setFontWeight(
      "normal"
    );


  updateCPUInterface();

  updateFlagsInterface();
}


function loadProgram() {

  resetSimulator();


  const assembly =
    assembleProgramFromSheet();


  loadProgramIntoRAM(
    assembly
  );


  updateCPUInterface();

  updateFlagsInterface();


  updateCPUStatus(
    "FETCH",
    "READY",
    "",
    "Programa cargado: " +
    assembly.bytes.length +
    " bytes"
  );


  SpreadsheetApp
    .getActiveSpreadsheet()
    .toast(
      "Programa cargado: " +
      assembly.bytes.length +
      " bytes",
      "CPU Simulator",
      3
    );
}
