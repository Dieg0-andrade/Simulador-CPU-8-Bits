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
function testJMP() {

  resetCPU();

  Logger.log("--- PRUEBA JMP ---");

  setRegister("PC", 5);

  Logger.log("PC antes = " + getRegister("PC"));

  const decoded = decode("JMP 10H");
  const execution = execute(decoded);
  store(execution);

  Logger.log("PC después = " + getRegister("PC"));
}
function testControlFlow() {

  resetCPU();

  Logger.log("--- PRUEBA JZ ---");

  setRegister("AX", 10);
  setRegister("BX", 10);

  CMP(
    getRegister("AX"),
    getRegister("BX")
  );

  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("PC antes de JZ = " + getRegister("PC"));

  let decoded = decode("JZ 20H");
  let execution = execute(decoded);
  store(execution);

  Logger.log("PC después de JZ = " + getRegister("PC"));


  Logger.log("--- PRUEBA JNZ ---");

  resetCPU();

  setRegister("AX", 10);
  setRegister("BX", 5);

  CMP(
    getRegister("AX"),
    getRegister("BX")
  );

  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("PC antes de JNZ = " + getRegister("PC"));

  decoded = decode("JNZ 30H");
  execution = execute(decoded);
  store(execution);

  Logger.log("PC después de JNZ = " + getRegister("PC"));


  Logger.log("--- PRUEBA HLT ---");

  decoded = decode("HLT");
  execution = execute(decoded);
  store(execution);

  Logger.log("CPU detenida = " + execution.halted);
}
function testStep() {

  resetSimulator();

  Logger.log("--- PRUEBA STEP ---");

  Logger.log(stepCPU());
  Logger.log(stepCPU());
  Logger.log(stepCPU());
  Logger.log(stepCPU());
  Logger.log(stepCPU());
}
function testRun() {

  resetSimulator();

  Logger.log("--- PRUEBA RUN ---");

  runCPU();
}
function testDemoProgram() {

  resetCPU();

  Logger.log("--- PROGRAMA DEMO ---");

  let decoded;
  let execution;

  decoded = decode("MOV AX, 0");
  execution = execute(decoded);
  store(execution);

  decoded = decode("MOV BX, 5");
  execution = execute(decoded);
  store(execution);

  Logger.log("AX inicial = " + getRegister("AX"));
  Logger.log("BX objetivo = " + getRegister("BX"));

  while (getRegister("AX") !== getRegister("BX")) {

    decoded = decode("INC AX");
    execution = execute(decoded);
    store(execution);

    decoded = decode("CMP AX, BX");
    execution = execute(decoded);
    store(execution);

    Logger.log(
      "AX = " + getRegister("AX") +
      " | BX = " + getRegister("BX") +
      " | ZF = " + getFlag("ZF")
    );
  }

  decoded = decode("STORE [80H], AX");
  execution = execute(decoded);
  store(execution);

  decoded = decode("HLT");
  execution = execute(decoded);
  store(execution);

  Logger.log("--- RESULTADO FINAL ---");

  Logger.log("AX = " + getRegister("AX"));
  Logger.log("BX = " + getRegister("BX"));
  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("RAM[80H] = " + Read(128));
  Logger.log("CPU detenida = " + execution.halted);
}
function testDemoProgramWithJNZ() {

  resetCPU();

  Logger.log("--- PROGRAMA DEMO CON JNZ ---");

  const program = {
    0: "MOV AX, 0",
    1: "MOV BX, 5",
    2: "INC AX",
    3: "CMP AX, BX",
    4: "JNZ 02H",
    5: "STORE [80H], AX",
    6: "HLT"
  };

  setRegister("PC", 0);

  let halted = false;
  let cycles = 0;

  while (!halted && cycles < 50) {

    const pc = getRegister("PC");
    const instruction = program[pc];

    if (instruction === undefined) {
      throw new Error(
        "No existe instrucción en la dirección " + pc
      );
    }

    Logger.log(
      "PC = " + pc +
      " | Instrucción = " + instruction
    );

    // PC apunta inicialmente a la siguiente instrucción
    setRegister("PC", pc + 1);

    const decoded = decode(instruction);
    const execution = execute(decoded);

    store(execution);

    if (execution.halted === true) {
      halted = true;
    }

    Logger.log(
      "AX = " + getRegister("AX") +
      " | BX = " + getRegister("BX") +
      " | ZF = " + getFlag("ZF") +
      " | PC = " + getRegister("PC")
    );

    cycles++;
  }

  if (cycles >= 50) {
    throw new Error(
      "Límite de ciclos alcanzado. Posible bucle infinito."
    );
  }

  Logger.log("--- RESULTADO FINAL ---");

  Logger.log("AX = " + getRegister("AX"));
  Logger.log("BX = " + getRegister("BX"));
  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("RAM[80H] = " + Read(128));
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("CPU detenida = " + halted);
  Logger.log("Ciclos ejecutados = " + cycles);
}
