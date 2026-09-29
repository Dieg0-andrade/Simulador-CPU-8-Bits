function testISA() {

  resetCPU();

  Logger.log("--- PRUEBA ISA COMPLETA ---");

  // MOV AX, 25
  let decoded = decode("MOV AX, 25");
  let execution = execute(decoded);
  store(execution);

  // MOV BX, AX
  decoded = decode("MOV BX, AX");
  execution = execute(decoded);
  store(execution);

  // STORE [80H], AX
  decoded = decode("STORE [80H], AX");
  execution = execute(decoded);
  store(execution);

  // LOAD BX, [80H]
  decoded = decode("LOAD BX, [80H]");
  execution = execute(decoded);
  store(execution);

  // ADD AX, BX
  decoded = decode("ADD AX, BX");
  execution = execute(decoded);
  store(execution);

  // SUB AX, BX
  decoded = decode("SUB AX, BX");
  execution = execute(decoded);
  store(execution);

  // INC AX
  decoded = decode("INC AX");
  execution = execute(decoded);
  store(execution);

  // DEC BX
  decoded = decode("DEC BX");
  execution = execute(decoded);
  store(execution);

  // CMP AX, BX
  decoded = decode("CMP AX, BX");
  execution = execute(decoded);
  store(execution);

  Logger.log("--- RESULTADO FINAL ---");
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("BX = " + getRegister("BX"));
  Logger.log("RAM[80H] = " + Read(128));
  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("CF = " + getFlag("CF"));
  Logger.log("SF = " + getFlag("SF"));
}
