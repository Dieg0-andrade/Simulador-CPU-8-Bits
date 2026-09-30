function testSimulator() {

  Logger.log(
    "--- PRUEBA GENERAL DEL SIMULADOR ---"
  );

  runAllTests();
}


function testLoadProgram() {

  Logger.log(
    "--- CARGA DEL PROGRAMA DEMO ---"
  );

  loadProgram();

  Logger.log(
    "Programa ensamblado y cargado en RAM"
  );
}


function testStepExecution() {

  Logger.log(
    "--- PRUEBA STEP ---"
  );

  resetSimulator();
  loadProgram();

  Logger.log(stepCPU());
  Logger.log(stepCPU());
  Logger.log(stepCPU());
  Logger.log(stepCPU());
}


function testRunExecution() {

  Logger.log(
    "--- PRUEBA RUN ---"
  );

  resetSimulator();
  loadProgram();

  runCPU();

  Logger.log(
    "Estado final = " +
    getCPUState()
  );

  Logger.log(
    "AX = " +
    formatHexByte(
      getRegister("AX")
    ) +
    "H"
  );

  Logger.log(
    "BX = " +
    formatHexByte(
      getRegister("BX")
    ) +
    "H"
  );

  Logger.log(
    "ZF = " +
    getFlag("ZF")
  );

  Logger.log(
    "RAM[80H] = " +
    formatHexByte(
      Read(0x80)
    ) +
    "H"
  );
}
