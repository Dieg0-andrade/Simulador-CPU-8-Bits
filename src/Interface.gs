function updateCPUInterface() {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  const registers = ["PC", "IR", "MAR", "MDR", "AX", "BX"];

  for (let i = 0; i < registers.length; i++) {

    const register = registers[i];
    const value = getRegister(register);

    const hexValue = value
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");

    sheet.getRange(i + 2, 1).setValue(register);

    sheet.getRange(i + 2, 2)
      .setNumberFormat("@")
      .setValue(hexValue);
  }
}


function updateFlagsInterface() {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  const flags = ["ZF", "CF", "SF"];

  for (let i = 0; i < flags.length; i++) {

    const flag = flags[i];

    sheet.getRange(i + 2, 4).setValue(flag);
    sheet.getRange(i + 2, 5).setValue(getFlag(flag));
  }
}


let cpuRunning = false;
let cpuPaused = false;

const phases = [
  "FETCH",
  "DECODE",
  "EXECUTE",
  "STORE"
];

const demoProgram = {
  0: "MOV AX, 0",
  1: "MOV BX, 5",
  2: "INC AX",
  3: "CMP AX, BX",
  4: "JNZ 02H",
  5: "STORE [80H], AX",
  6: "HLT"
};


function updateCPUStatus(phase, status, instruction, operation) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  if (phase !== null) {
    sheet.getRange("E8").setValue(phase);
  }

  if (status !== null) {
    sheet.getRange("E9").setValue(status);
  }

  if (instruction !== null) {
    sheet.getRange("E10").setValue(instruction);
  }

  if (operation !== null) {
    sheet.getRange("E11").setValue(operation);
  }
}


function highlightPhase(phase) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  const cell = sheet.getRange("E8");

  switch (phase) {

    case "FETCH":
      cell.setBackground("#D9EAD3");
      break;

    case "DECODE":
      cell.setBackground("#FFF2CC");
      break;

    case "EXECUTE":
      cell.setBackground("#F4CCCC");
      break;

    case "STORE":
      cell.setBackground("#D9D2E9");
      break;

    default:
      cell.setBackground("#FFFFFF");
  }

  cell.setFontWeight("bold");
}


function addLog(phase, operation) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  let row = 24;

  while (sheet.getRange(row, 3).getValue() !== "") {
    row++;
  }

  const now = new Date();

  sheet.getRange(row, 3).setValue(now);
  sheet.getRange(row, 3).setNumberFormat("HH:mm:ss");

  sheet.getRange(row, 4).setValue(phase);
  sheet.getRange(row, 5).setValue(operation);
}


function stepCPU() {

  const properties = PropertiesService.getScriptProperties();

  let currentPhase = Number(
    properties.getProperty("currentPhase") || 0
  );

  const phase = phases[currentPhase];

  let instruction =
    properties.getProperty("currentInstruction") || "";

  let operation = "";

  Logger.log("STEP: Fase actual = " + phase);

  switch (phase) {

    case "FETCH":

      const pc = getRegister("PC");

      instruction = demoProgram[pc];

      if (instruction === undefined) {

        updateCPUStatus(
          "FETCH",
          "HALTED",
          "",
          "No hay más instrucciones"
        );

        throw new Error(
          "No existe instrucción en la dirección " + pc
        );
      }

      setRegister("MAR", pc);
      setRegister("MDR", pc);
      setRegister("IR", pc);

      setRegister("PC", pc + 1);

      properties.setProperty(
        "currentInstruction",
        instruction
      );

      operation = "PC -> MAR -> MDR -> IR; PC++";

      break;


    case "DECODE":

      if (instruction === "") {
        throw new Error(
          "No existe instrucción para decodificar"
        );
      }

      const decoded = decode(instruction);

      properties.setProperty(
        "decodedInstruction",
        JSON.stringify(decoded)
      );

      operation = "Decodificando: " + instruction;

      break;


    case "EXECUTE":

      const decodedText =
        properties.getProperty("decodedInstruction");

      if (!decodedText) {
        throw new Error(
          "No existe una instrucción decodificada"
        );
      }

      const decodedInstruction =
        JSON.parse(decodedText);

      const execution =
        execute(decodedInstruction);

      properties.setProperty(
        "executionResult",
        JSON.stringify(execution)
      );

      operation = "Ejecutando: " + instruction;

      break;


    case "STORE":

      const executionText =
        properties.getProperty("executionResult");

      if (!executionText) {
        throw new Error(
          "No existe resultado de ejecución"
        );
      }

      const executionResult =
        JSON.parse(executionText);

      store(executionResult);

      operation = "STORE completado: " + instruction;

      if (executionResult.halted === true) {

        updateCPUStatus(
          "STORE",
          "HALTED",
          instruction,
          "CPU detenida por HLT"
        );

        highlightPhase("STORE");

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

        Logger.log("STEP: CPU detenida por HLT");

        return "HLT";
      }

      break;
  }


  updateCPUStatus(
    phase,
    "RUNNING",
    instruction,
    operation
  );

  highlightPhase(phase);

  addLog(phase, operation);

  updateCPUInterface();
  updateFlagsInterface();

  currentPhase++;

  if (currentPhase >= phases.length) {
    currentPhase = 0;
  }

  properties.setProperty(
    "currentPhase",
    String(currentPhase)
  );

  return phase;
}


function runCPU() {

  const properties = PropertiesService.getScriptProperties();

  properties.setProperty(
    "runState",
    "RUNNING"
  );

  Logger.log("RUN: Ejecución automática iniciada");

  updateCPUStatus(
    null,
    "RUNNING",
    null,
    null
  );

  for (let i = 0; i < 100; i++) {

    const runState =
      properties.getProperty("runState");

    if (runState === "PAUSED") {

      Logger.log("RUN: Ejecución pausada");

      updateCPUStatus(
        null,
        "PAUSED",
        null,
        "Ejecución pausada"
      );

      return;
    }

    const phase = stepCPU();

    Logger.log("RUN: " + phase);

    if (phase === "HLT") {

      properties.setProperty(
        "runState",
        "HALTED"
      );

      Logger.log("RUN: CPU detenida por HLT");

      return;
    }

    Utilities.sleep(500);
  }

  properties.setProperty(
    "runState",
    "STOPPED"
  );

  Logger.log(
    "RUN: Límite de ejecución alcanzado"
  );
}


function pauseCPU() {

  const properties = PropertiesService.getScriptProperties();

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

  Logger.log("PAUSE: Ejecución pausada");
}


function resetSimulator() {

  resetCPU();

  cpuRunning = false;
  cpuPaused = false;

  const properties = PropertiesService.getScriptProperties();

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
    "decodedInstruction"
  );

  properties.deleteProperty(
    "executionResult"
  );

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  sheet.getRange("C24:E100").clearContent();

  updateCPUStatus(
    "FETCH",
    "READY",
    "",
    ""
  );

  const phaseCell = sheet.getRange("E8");

  phaseCell
    .setBackground("#FFFFFF")
    .setFontWeight("normal");

  updateCPUInterface();
  updateFlagsInterface();

  Logger.log("RESET: Simulador reiniciado");
}


function loadProgram() {

  resetSimulator();

  Logger.log("LOAD PROGRAM: Programa demo cargado");

  SpreadsheetApp
    .getActiveSpreadsheet()
    .toast(
      "Programa cargado correctamente",
      "CPU Simulator",
      3
    );
}
