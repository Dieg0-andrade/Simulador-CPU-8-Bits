function testFetch() {

  resetCPU();

  // Guardamos un valor en la primera posición de RAM
  Write(0, 10);

  Logger.log("--- ANTES DEL FETCH ---");
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("IR = " + getRegister("IR"));

  fetch();

  Logger.log("--- DESPUES DEL FETCH ---");
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("MAR = " + getRegister("MAR"));
  Logger.log("MDR = " + getRegister("MDR"));
  Logger.log("IR = " + getRegister("IR"));
}
