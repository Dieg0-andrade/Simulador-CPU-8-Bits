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
    "--- TESTS P0-1 / P0-2 ---"
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
    i < expectedBytes.length;
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


  assertEqual(
    "PC después del operando",
    0x02,
    getRegister("PC")
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


  Logger.log(
    "--- TODOS LOS TESTS P0-1 / P0-2: PASS ---"
  );
}
