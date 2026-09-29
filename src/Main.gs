function testExecuteStore() {

  resetCPU();

  setRegister("AX", 10);
  setRegister("BX", 5);

  Logger.log("--- ESTADO INICIAL ---");
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("BX = " + getRegister("BX"));

  const decoded = decode("SUB AX, BX");

  const executionResult = execute(decoded);

  store(executionResult);

  Logger.log("--- ESTADO FINAL ---");
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("BX = " + getRegister("BX"));
}
