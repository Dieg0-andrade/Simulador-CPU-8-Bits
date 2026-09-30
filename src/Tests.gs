function assertEqual(
  name,
  expected,
  actual
) {

  if (
    expected !== actual
  ) {

    throw new Error(
      "FAIL: " +
      name +
      " | esperado=" +
      expected +
      " obtenido=" +
      actual
    );
  }

  Logger.log(
    "PASS: " +
    name
  );
}


function runAllTests() {

  Logger.log(
    "--- TESTS P0-1 A P0-6 ---"
  );


  const assembly =
    assembleProgramFromSheet();


  loadProgramIntoRAM(
    assembly
  );


  const expectedBytes = [
    0x10,
    0x00,
    0x11,
    0x05,
    0x50,
    0x42,
    0x62,
    0x04,
    0x22,
    0x80,
    0x00
  ];


  for (
    let i = 0;
    i <
    expectedBytes.length;
    i++
  ) {

    assertEqual(
      "RAM[" +
      formatHexByte(i) +
      "H]",
      expectedBytes[i],
      Read(i)
    );
  }


  resetCPU();


  const opcode =
    fetch();


  assertEqual(
    "FETCH lee opcode desde RAM",
    0x10,
    opcode
  );


  assertEqual(
    "MAR después de FETCH",
    0x00,
    getRegister("MAR")
  );


  assertEqual(
    "MDR después de FETCH",
    0x10,
    getRegister("MDR")
  );


  assertEqual(
    "IR después de FETCH",
    0x10,
    getRegister("IR")
  );


  assertEqual(
    "PC después del opcode",
    0x01,
    getRegister("PC")
  );


  const operand =
    fetchOperandByte();


  assertEqual(
    "Operando leído desde RAM",
    0x00,
    operand
  );


  Write(
    0,
    0x50
  );


  resetCPU();


  const editedOpcode =
    fetch();


  assertEqual(
    "Editar RAM cambia el FETCH",
    0x50,
    editedOpcode
  );


  loadProgramIntoRAM(
    assembly
  );


  resetCPU();


  Write(
    255,
    0x00
  );


  setRegister(
    "PC",
    255
  );


  fetch();


  assertEqual(
    "PC hace wrap FFH -> 00H",
    0,
    getRegister("PC")
  );


  resetSimulator();


  setCPUState(
    "HALTED"
  );


  const haltedResult =
    stepCPU();


  assertEqual(
    "STEP después de HLT no ejecuta",
    "HALTED",
    haltedResult
  );


  loadProgramIntoRAM(
    assembly
  );


  resetSimulator();


  Write(
    0,
    0xFE
  );


  const errorResult =
    stepCPU();


  assertEqual(
    "Opcode inválido genera ERROR",
    "ERROR",
    errorResult
  );


  assertEqual(
    "Estado ERROR registrado",
    "ERROR",
    getCPUState()
  );


  loadProgramIntoRAM(
    assembly
  );


  resetSimulator();


  const addImmediate =
    assembleInstruction(
      "ADD AX, 5",
      1
    );


  assertEqual(
    "ADD AX,5 opcode",
    0x30,
    addImmediate.bytes[0]
  );


  assertEqual(
    "ADD AX,5 operando",
    0x05,
    addImmediate.bytes[1]
  );


  const subImmediate =
    assembleInstruction(
      "SUB AX, 0x03",
      1
    );


  assertEqual(
    "SUB AX,0x03 opcode",
    0x34,
    subImmediate.bytes[0]
  );


  const cmpImmediate =
    assembleInstruction(
      "CMP AX, 05H",
      1
    );


  assertEqual(
    "CMP AX,05H opcode",
    0x40,
    cmpImmediate.bytes[0]
  );


  resetCPU();


  setRegister(
    "AX",
    10
  );


  let decoded =
    decode(
      "ADD AX, 5"
    );


  let execution =
    execute(decoded);


  store(execution);


  assertEqual(
    "ADD AX,5 resultado",
    15,
    getRegister("AX")
  );


  resetCPU();


  setRegister(
    "AX",
    10
  );


  decoded =
    decode(
      "SUB AX, 0x03"
    );


  execution =
    execute(decoded);


  store(execution);


  assertEqual(
    "SUB AX,0x03 resultado",
    7,
    getRegister("AX")
  );


  resetCPU();


  setRegister(
    "AX",
    5
  );


  decoded =
    decode(
      "CMP AX, 05H"
    );


  execution =
    execute(decoded);


  store(execution);


  assertEqual(
    "CMP AX,05H activa ZF",
    1,
    getFlag("ZF")
  );


  const andImmediate =
    assembleInstruction(
      "AND AX, 0FH",
      1
    );


  assertEqual(
    "AND AX,0FH opcode",
    0x70,
    andImmediate.bytes[0]
  );


  const orImmediate =
    assembleInstruction(
      "OR AX, 01H",
      1
    );


  assertEqual(
    "OR AX,01H opcode",
    0x74,
    orImmediate.bytes[0]
  );


  const xorImmediate =
    assembleInstruction(
      "XOR AX, FFH",
      1
    );


  assertEqual(
    "XOR AX,FFH opcode",
    0x78,
    xorImmediate.bytes[0]
  );


  const notAX =
    assembleInstruction(
      "NOT AX",
      1
    );


  assertEqual(
    "NOT AX opcode",
    0x7C,
    notAX.bytes[0]
  );


  resetCPU();


  setRegister(
    "AX",
    0xF0
  );


  decoded =
    decode(
      "AND AX, 0FH"
    );


  execution =
    execute(decoded);


  store(execution);


  assertEqual(
    "AND resultado",
    0x00,
    getRegister("AX")
  );


  assertEqual(
    "AND activa ZF",
    1,
    getFlag("ZF")
  );


  assertEqual(
    "AND limpia CF",
    0,
    getFlag("CF")
  );


  resetCPU();


  setRegister(
    "AX",
    0xF0
  );


  decoded =
    decode(
      "OR AX, 0FH"
    );


  execution =
    execute(decoded);


  store(execution);


  assertEqual(
    "OR resultado",
    0xFF,
    getRegister("AX")
  );


  assertEqual(
    "OR activa SF",
    1,
    getFlag("SF")
  );


  assertEqual(
    "OR limpia CF",
    0,
    getFlag("CF")
  );


  resetCPU();


  setRegister(
    "AX",
    0xAA
  );


  setRegister(
    "BX",
    0xAA
  );


  decoded =
    decode(
      "XOR AX, BX"
    );


  execution =
    execute(decoded);


  store(execution);


  assertEqual(
    "XOR reg,reg resultado",
    0,
    getRegister("AX")
  );


  assertEqual(
    "XOR activa ZF",
    1,
    getFlag("ZF")
  );


  resetCPU();


  setRegister(
    "AX",
    0x00
  );


  decoded =
    decode(
      "NOT AX"
    );


  execution =
    execute(decoded);


  store(execution);


  assertEqual(
    "NOT resultado",
    0xFF,
    getRegister("AX")
  );


  assertEqual(
    "NOT activa SF",
    1,
    getFlag("SF")
  );


  assertEqual(
    "NOT limpia CF",
    0,
    getFlag("CF")
  );


  resetCPU();


  Write(
    0x80,
    0x2A
  );


  decoded =
    decode(
      "LOAD AX, [80H]"
    );


  execution =
    execute(decoded);


  assertEqual(
    "LOAD coloca dirección en MAR",
    0x80,
    getRegister("MAR")
  );


  assertEqual(
    "LOAD mueve RAM a MDR",
    0x2A,
    getRegister("MDR")
  );


  store(execution);


  assertEqual(
    "LOAD mueve MDR a AX",
    0x2A,
    getRegister("AX")
  );


  resetCPU();


  setRegister(
    "BX",
    0x37
  );


  decoded =
    decode(
      "STORE [81H], BX"
    );


  execution =
    execute(decoded);


  assertEqual(
    "STORE coloca dirección en MAR",
    0x81,
    getRegister("MAR")
  );


  assertEqual(
    "STORE mueve BX a MDR",
    0x37,
    getRegister("MDR")
  );


  store(execution);


  assertEqual(
    "STORE mueve MDR a RAM",
    0x37,
    Read(0x81)
  );


  loadProgramIntoRAM(
    assembly
  );


  resetSimulator();


  Logger.log(
    "--- TODOS LOS TESTS P0-1 A P0-6: PASS ---"
  );
}
