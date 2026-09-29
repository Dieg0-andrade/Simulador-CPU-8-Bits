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


function updateCPUStatus(phase, status, instruction, operation) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

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

  Logger.log("STEP: Fase actual = " + phase);

  let operation = "";

  switch (phase) {

    case "FETCH":
      operation = "PC -> MAR -> MDR -> IR";
      break;

    case "DECODE":
      operation = "Decodificando instrucción";
      break;

    case "EXECUTE":
      operation = "Ejecutando operación";
      break;

    case "STORE":
      operation = "Almacenando resultado";
      break;
  }

  updateCPUStatus(
  phase,
  "RUNNING",
  null,
  operation
);

highlightPhase(phase);

addLog(phase, operation);

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

  cpuRunning = true;
  cpuPaused = false;

  Logger.log("RUN: Ejecución automática iniciada");

  for (let i = 0; i < 20; i++) {

    if (cpuPaused) {
      Logger.log("RUN: Ejecución pausada");
      break;
    }

    const phase = stepCPU();

    Logger.log("RUN: " + phase);

    Utilities.sleep(500);
  }

  cpuRunning = false;

  Logger.log("RUN: Ejecución finalizada");
}


function pauseCPU() {

  cpuPaused = true;

  Logger.log("PAUSE: Ejecución pausada");
}


function resetSimulator() {

  resetCPU();

  cpuRunning = false;
  cpuPaused = false;

  PropertiesService
    .getScriptProperties()
    .setProperty("currentPhase", "0");

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("CPU");

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

  Logger.log("LOAD PROGRAM: Programa cargado");

  SpreadsheetApp
    .getActiveSpreadsheet()
    .toast(
      "Programa cargado correctamente",
      "CPU Simulator",
      3
    );
}
