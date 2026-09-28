function testLogicalALU() {

  resetCPU();

  Logger.log("AND 12, 10 = " + AND(12, 10));
  Logger.log("OR 12, 10 = " + OR(12, 10));
  Logger.log("XOR 12, 10 = " + XOR(12, 10));
  Logger.log("NOT 10 = " + NOT(10));

  CMP(10, 5);
  Logger.log("CMP 17, 8");
  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("CF = " + getFlag("CF"));
  Logger.log("SF = " + getFlag("SF"));
}
