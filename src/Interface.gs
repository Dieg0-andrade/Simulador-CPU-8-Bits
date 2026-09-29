function updateCPUInterface() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
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

    sheet.getRange(i + 3, 1).setValue(register);
    sheet.getRange(i + 3, 2).setNumberFormat("@").setValue(hexValue);
  }
}
function updateFlagsInterface() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  const flags = ["ZF", "CF", "SF"];

  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];

    sheet.getRange(i + 3, 4).setValue(flag);
    sheet.getRange(i + 3, 5).setValue(getFlag(flag));
  }
}
let cpuRunning = false;
let cpuPaused = false;
let currentPhase = 0;

const phases = [
  "FETCH",
  "DECODE",
  "EXECUTE",
  "STORE"
];


function stepCPU() {

  const phase = phases[currentPhase];

  Logger.log("STEP: Fase actual = " + phase);

  currentPhase++;

  if (currentPhase >= phases.length) {
    currentPhase = 0;
  }

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

  currentPhase = 0;
  cpuRunning = false;
  cpuPaused = false;

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
