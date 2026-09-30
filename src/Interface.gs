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

  const values =
    registers.map(
      register => {

        const value =
          getRegister(register);

        const hexValue =
          value
            .toString(16)
            .toUpperCase()
            .padStart(2, "0");

        return [
          register,
          hexValue
        ];
      }
    );

  sheet
    .getRange(
      2,
      1,
      values.length,
      2
    )
    .setNumberFormat("@")
    .setValues(values);
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

  const values =
    flags.map(
      flag => [
        flag,
        getFlag(flag)
      ]
    );

  sheet
    .getRange(
      2,
      4,
      values.length,
      2
    )
    .setValues(values);
}


const phases = [
  "FETCH",
  "DECODE",
  "EXECUTE",
  "STORE"
];


function ensureInterfaceControls() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");

  if (!sheet) {
    throw new Error(
      "No existe la hoja CPU"
    );
  }

  sheet
    .getRange("D13")
    .setValue("Velocidad (ms)");

  if (
    sheet
      .getRange("E13")
      .getValue() === ""
  ) {

    sheet
      .getRange("E13")
      .setValue(500);
  }

  const speedValidation =
    SpreadsheetApp
      .newDataValidation()
      .requireValueInList(
        [
          "100",
          "250",
          "500",
          "1000",
          "2000"
        ],
        true
      )
      .setAllowInvalid(false)
      .build();

  sheet
    .getRange("E13")
    .setDataValidation(
      speedValidation
    );

  sheet
    .getRange("D14")
    .setValue(
      "Máx. instrucciones"
    );

  if (
    sheet
      .getRange("E14")
      .getValue() === ""
  ) {

    sheet
      .getRange("E14")
      .setValue(500);
  }

  const instructionValidation =
    SpreadsheetApp
      .newDataValidation()
      .requireValueInList(
        [
          "50",
          "100",
          "250",
          "500",
          "1000"
        ],
        true
      )
      .setAllowInvalid(false)
      .build();

  sheet
    .getRange("E14")
    .setDataValidation(
      instructionValidation
    );
}


function getRunDelay() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");

  const value =
    Number(
      sheet
        .getRange("E13")
        .getValue()
    );

  const allowedValues = [
    100,
    250,
    500,
    1000,
    2000
  ];

  if (
    !allowedValues.includes(value)
  ) {
    return 500;
  }

  return value;
}


function getMaxInstructions() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");

  const value =
    Number(
      sheet
        .getRange("E14")
        .getValue()
    );

  const allowedValues = [
    50,
    100,
    250,
    500,
    1000
  ];

  if (
    !allowedValues.includes(value)
  ) {
    return 500;
  }

  return value;
}


function getInstructionCount() {

  return Number(
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "instructionCount"
      ) || 0
  );
}


function incrementInstructionCount() {

  const properties =
    PropertiesService
      .getScriptProperties();

  const current =
    getInstructionCount();

  properties.setProperty(
    "instructionCount",
    String(
      current + 1
    )
  );
}


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

  if (
    phase !== null
  ) {

    sheet
      .getRange("E8")
      .setValue(phase);
  }

  if (
    status !== null
  ) {

    sheet
      .getRange("E9")
      .setValue(status);
  }

  if (
    instruction !== null
  ) {

    sheet
      .getRange("E10")
      .setValue(instruction);
  }

  if (
    operation !== null
  ) {

    sheet
      .getRange("E11")
      .setValue(operation);
  }
}


function highlightPhase(
  phase
) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");

  if (!sheet) {
    return;
  }

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


function clearComponentHighlights() {

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const cpuSheet =
    spreadsheet
      .getSheetByName("CPU");

  const ramSheet =
    spreadsheet
      .getSheetByName("RAM");

  if (cpuSheet) {

    cpuSheet
      .getRange("B2:B7")
      .setBackground(
        "#FFFFFF"
      );
  }

  if (ramSheet) {

    ramSheet
      .getRange(
        2,
        2,
        256,
        1
      )
      .setBackground(
        "#FFFFFF"
      );
  }
}


function highlightRegister(
  registerName,
  color
) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");

  if (!sheet) {
    return;
  }

  const registerRows = {
    PC: 2,
    IR: 3,
    MAR: 4,
    MDR: 5,
    AX: 6,
    BX: 7
  };

  const row =
    registerRows[
      registerName
    ];

  if (!row) {
    return;
  }

  sheet
    .getRange(
      row,
      2
    )
    .setBackground(
      color
    )
    .setFontWeight(
      "bold"
    );
}


function highlightRAMAddress(
  address
) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("RAM");

  if (!sheet) {
    return;
  }

  if (
    !Number.isInteger(address) ||
    address < 0 ||
    address > 255
  ) {
    return;
  }

  const row =
    address + 2;

  sheet
    .getRange(
      row,
      2
    )
    .setBackground(
      "#FFF2CC"
    )
    .setFontWeight(
      "bold"
    );
}


function highlightCPUPath(
  phase
) {

  clearComponentHighlights();

  const properties =
    PropertiesService
      .getScriptProperties();

  const green =
    "#D9EAD3";

  const yellow =
    "#FFF2CC";

  const red =
    "#F4CCCC";

  const purple =
    "#D9D2E9";


  if (
    phase === "FETCH"
  ) {

    highlightRegister(
      "PC",
      green
    );

    highlightRegister(
      "MAR",
      green
    );

    highlightRegister(
      "MDR",
      green
    );

    highlightRegister(
      "IR",
      green
    );

    highlightRAMAddress(
      getRegister("MAR")
    );

    return;
  }


  if (
    phase === "DECODE"
  ) {

    highlightRegister(
      "IR",
      yellow
    );

    highlightRegister(
      "MAR",
      yellow
    );

    highlightRegister(
      "MDR",
      yellow
    );

    highlightRAMAddress(
      getRegister("MAR")
    );

    return;
  }


  if (
    phase === "EXECUTE"
  ) {

    const decodedText =
      properties
        .getProperty(
          "decodedInstruction"
        );

    if (!decodedText) {
      return;
    }

    const decoded =
      JSON.parse(
        decodedText
      );

    const operands =
      decoded.operands || [];

    const operandTypes =
      decoded.operandTypes || [];


    for (
      let i = 0;
      i < operands.length;
      i++
    ) {

      if (
        operandTypes[i] ===
        "REGISTER"
      ) {

        highlightRegister(
          operands[i],
          red
        );
      }

      if (
        operandTypes[i] ===
        "MEMORY"
      ) {

        const address =
          parseMemoryAddress(
            operands[i]
          );

        highlightRegister(
          "MAR",
          red
        );

        highlightRegister(
          "MDR",
          red
        );

        highlightRAMAddress(
          address
        );
      }
    }

    return;
  }


  if (
    phase === "STORE"
  ) {

    const executionText =
      properties
        .getProperty(
          "executionResult"
        );

    if (!executionText) {
      return;
    }

    const execution =
      JSON.parse(
        executionText
      );


    if (
      execution.destination ===
      "AX"
    ) {

      highlightRegister(
        "AX",
        purple
      );
    }


    if (
      execution.destination ===
      "BX"
    ) {

      highlightRegister(
        "BX",
        purple
      );
    }


    if (
      execution.destination ===
      "MEMORY"
    ) {

      highlightRegister(
        "MAR",
        purple
      );

      highlightRegister(
        "MDR",
        purple
      );

      highlightRAMAddress(
        getRegister("MAR")
      );
    }
  }
}


function addLog(
  phase,
  operation
) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("CPU");

  if (!sheet) {
    return;
  }

  const properties =
    PropertiesService
      .getScriptProperties();

  let row =
    Number(
      properties
        .getProperty(
          "logRow"
        ) || 24
    );

  let stepNumber =
    Number(
      properties
        .getProperty(
          "stepCount"
        ) || 0
    );

  stepNumber++;

  const now =
    new Date();

  sheet
    .getRange(
      row,
      3,
      1,
      3
    )
    .setValues([
      [
        now,
        "[Paso " +
        String(stepNumber)
          .padStart(
            2,
            "0"
          ) +
        "] " +
        phase,
        operation
      ]
    ]);

  sheet
    .getRange(
      row,
      3
    )
    .setNumberFormat(
      "HH:mm:ss"
    );

  row++;

  properties.setProperty(
    "logRow",
    String(row)
  );

  properties.setProperty(
    "stepCount",
    String(stepNumber)
  );
}


function getCPUState() {

  return PropertiesService
    .getScriptProperties()
    .getProperty(
      "runState"
    ) || "READY";
}


function setCPUState(
  state
) {

  PropertiesService
    .getScriptProperties()
    .setProperty(
      "runState",
      state
    );
}


function showCPUMessage(
  message
) {

  SpreadsheetApp
    .getActiveSpreadsheet()
    .toast(
      message,
      "CPU Simulator",
      3
    );
}


function handleCPUError(
  error
) {

  const message =
    error instanceof Error
      ? error.message
      : String(error);

  setCPUState(
    "ERROR"
  );

  updateCPUStatus(
    null,
    "ERROR",
    null,
    message
  );

  addLog(
    "ERROR",
    message
  );

  showCPUMessage(
    message
  );

  Logger.log(
    "ERROR: " +
    message
  );

  SpreadsheetApp.flush();

  return "ERROR";
}


function stepCPU() {

  const properties =
    PropertiesService
      .getScriptProperties();

  const initialState =
    getCPUState();


  if (
    initialState ===
    "HALTED"
  ) {

    showCPUMessage(
      "CPU detenida, presione RESET"
    );

    return "HALTED";
  }


  if (
    initialState ===
    "ERROR"
  ) {

    showCPUMessage(
      "CPU en estado ERROR, presione RESET"
    );

    return "ERROR";
  }


  try {

    let currentPhase =
      Number(
        properties
          .getProperty(
            "currentPhase"
          ) || 0
      );

    const phase =
      phases[
        currentPhase
      ];

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
          String(
            opcodeByte
          )
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
          formatHexByte(
            fetchAddress
          ) +
          "H, MDR=" +
          formatHexByte(
            opcodeByte
          ) +
          "H -> IR=" +
          formatHexByte(
            opcodeByte
          ) +
          "H, PC=" +
          formatHexByte(
            getRegister(
              "PC"
            )
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
          opcodeText ===
          null
        ) {

          throw new Error(
            "No existe opcode para decodificar"
          );
        }

        const opcodeByte =
          Number(
            opcodeText
          );

        const definition =
          getInstructionDefinitionByOpcode(
            opcodeByte
          );

        let operandByte =
          null;

        let operandAddress =
          null;

        if (
          definition.bytes ===
          2
        ) {

          operandAddress =
            getRegister(
              "PC"
            );

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
          JSON.stringify(
            decoded
          )
        );

        if (
          definition.bytes ===
          2
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

        if (
          !decodedText
        ) {

          throw new Error(
            "No existe instrucción decodificada"
          );
        }

        const decoded =
          JSON.parse(
            decodedText
          );

        const execution =
          execute(
            decoded
          );

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

        if (
          !executionText
        ) {

          throw new Error(
            "No existe resultado de ejecución"
          );
        }

        const execution =
          JSON.parse(
            executionText
          );

        store(
          execution
        );

        incrementInstructionCount();

        operation =
          "STORE completado: " +
          instruction;

        if (
          execution.halted ===
          true
        ) {

          setCPUState(
            "HALTED"
          );

          updateCPUStatus(
            "STORE",
            "HALTED",
            instruction,
            "CPU detenida por HLT"
          );

          highlightPhase(
            "STORE"
          );

          highlightCPUPath(
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

          SpreadsheetApp.flush();

          return "HLT";
        }

        break;
      }
    }


    const finalStatus =
      initialState ===
      "PAUSED"
        ? "PAUSED"
        : "RUNNING";


    updateCPUStatus(
      phase,
      finalStatus,
      instruction,
      operation
    );


    highlightPhase(
      phase
    );


    highlightCPUPath(
      phase
    );


    addLog(
      phase,
      operation
    );


    updateCPUInterface();

    updateFlagsInterface();


    SpreadsheetApp.flush();


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
      String(
        currentPhase
      )
    );


    if (
      initialState !==
      "PAUSED"
    ) {

      setCPUState(
        "RUNNING"
      );
    }


    return phase;
  }

  catch (error) {

    return handleCPUError(
      error
    );
  }
}


function runCPU() {

  const state =
    getCPUState();


  if (
    state ===
    "HALTED"
  ) {

    showCPUMessage(
      "CPU detenida, presione RESET"
    );

    return;
  }


  if (
    state ===
    "ERROR"
  ) {

    showCPUMessage(
      "CPU en estado ERROR, presione RESET"
    );

    return;
  }


  ensureInterfaceControls();


  setCPUState(
    "RUNNING"
  );


  updateCPUStatus(
    null,
    "RUNNING",
    null,
    null
  );


  const startTime =
    Date.now();


  const maxRunTime =
    280000;


  const initialInstructionCount =
    getInstructionCount();


  const maxInstructions =
    getMaxInstructions();


  while (true) {

    const runState =
      getCPUState();


    if (
      runState ===
      "PAUSED"
    ) {

      updateCPUStatus(
        null,
        "PAUSED",
        null,
        "Ejecución pausada"
      );

      SpreadsheetApp.flush();

      return;
    }


    if (
      runState ===
      "ERROR"
    ) {

      return;
    }


    const elapsedTime =
      Date.now() -
      startTime;


    if (
      elapsedTime >=
      maxRunTime
    ) {

      setCPUState(
        "PAUSED"
      );

      updateCPUStatus(
        null,
        "PAUSED",
        null,
        "Pausa automática por límite de tiempo"
      );

      addLog(
        "PAUSE",
        "Ejecución pausada antes del límite de Apps Script"
      );

      showCPUMessage(
        "Ejecución pausada por seguridad. Presione RUN para continuar."
      );

      SpreadsheetApp.flush();

      return;
    }


    const executedInstructions =
      getInstructionCount() -
      initialInstructionCount;


    if (
      executedInstructions >=
      maxInstructions
    ) {

      setCPUState(
        "PAUSED"
      );

      updateCPUStatus(
        null,
        "PAUSED",
        null,
        "Límite de instrucciones alcanzado"
      );

      addLog(
        "PAUSE",
        "Límite de instrucciones alcanzado"
      );

      showCPUMessage(
        "Límite de instrucciones alcanzado"
      );

      SpreadsheetApp.flush();

      return;
    }


    const phase =
      stepCPU();


    if (
      phase === "HLT" ||
      phase === "ERROR"
    ) {

      return;
    }


    const delay =
      getRunDelay();


    Utilities.sleep(
      delay
    );
  }
}


function pauseCPU() {

  const state =
    getCPUState();


  if (
    state ===
    "HALTED"
  ) {

    showCPUMessage(
      "La CPU ya está detenida"
    );

    return;
  }


  if (
    state ===
    "ERROR"
  ) {

    showCPUMessage(
      "CPU en estado ERROR, presione RESET"
    );

    return;
  }


  setCPUState(
    "PAUSED"
  );


  updateCPUStatus(
    null,
    "PAUSED",
    null,
    "Ejecución pausada"
  );


  addLog(
    "PAUSE",
    "Ejecución pausada por el usuario"
  );


  SpreadsheetApp.flush();
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
    "READY"
  );


  properties.setProperty(
    "logRow",
    "24"
  );


  properties.setProperty(
    "stepCount",
    "0"
  );


  properties.setProperty(
    "instructionCount",
    "0"
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


  if (!sheet) {
    throw new Error(
      "No existe la hoja CPU"
    );
  }


  const rowsToClear =
    Math.max(
      sheet.getMaxRows() -
      23,
      1
    );


  sheet
    .getRange(
      24,
      3,
      rowsToClear,
      3
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


  clearComponentHighlights();


  ensureInterfaceControls();


  updateCPUInterface();

  updateFlagsInterface();


  SpreadsheetApp.flush();
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


  SpreadsheetApp.flush();


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


function onOpen() {

  SpreadsheetApp
    .getUi()
    .createMenu(
      "CPU Simulator"
    )
    .addItem(
      "LOAD PROGRAM",
      "loadProgram"
    )
    .addSeparator()
    .addItem(
      "STEP",
      "stepCPU"
    )
    .addItem(
      "RUN",
      "runCPU"
    )
    .addItem(
      "PAUSE",
      "pauseCPU"
    )
    .addSeparator()
    .addItem(
      "RESET",
      "resetSimulator"
    )
    .addToUi();


  ensureInterfaceControls();
}
