function testALU() {
  resetCPU();

  Logger.log("ADD 10 + 5= " + ADD(10, 5));
  Logger.log("SUB 10 - 5 = " + SUB(10,5));
  Logger.log("INC 10 = " + INC(10));
  Logger.log("DEC 10 = " + DEC(10));
}
