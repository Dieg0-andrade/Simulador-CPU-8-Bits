/*** Actualiza ZF y SF según un resultado de 8 bits.*/
function updateArithmeticFlags(result) {
  const byteResult = result & 0xFF;

  // Zero Flag: resultado igual a cero
  setFlag("ZF", byteResult === 0 ? 1 : 0);

  // Sign Flag: bit más significativo
  setFlag("SF", (byteResult & 0x80) !== 0 ? 1 : 0);
}

/*** Suma dos valores de 8 bits.*/
function ADD(a, b) {
  const fullResult = a + b;

  // Carry si el resultado supera 255
  setFlag("CF", fullResult > 255 ? 1 : 0);

  // Conservamos únicamente los 8 bits inferiores
  const result = fullResult & 0xFF;

  updateArithmeticFlags(result);

  return result;
}

/*** Resta dos valores de 8 bits.*/
function SUB(a, b) {
  const fullResult = a - b;

  // En nuestra simulación CF indica préstamo en una resta
  setFlag("CF", fullResult < 0 ? 1 : 0);

  const result = fullResult & 0xFF;

  updateArithmeticFlags(result);

  return result;
}

/*** Incrementa un valor en 1.*/
function INC(value) {
  return ADD(value, 1);
}

/*** Decrementa un valor en 1.*/
function DEC(value) {
  return SUB(value, 1);
}
/*** Operación lógica AND.*/
function AND(a, b) {
  const result = (a & b) & 0xFF;

  setFlag("CF", 0);
  updateArithmeticFlags(result);

  return result;
}

/*** Operación lógica OR.*/
function OR(a, b) {
  const result = (a | b) & 0xFF;

  setFlag("CF", 0);
  updateArithmeticFlags(result);

  return result;
}

/*** Operación lógica XOR.*/
function XOR(a, b) {
  const result = (a ^ b) & 0xFF;

  setFlag("CF", 0);
  updateArithmeticFlags(result);

  return result;
}

/*** Operación lógica NOT.*/
function NOT(a) {
  const result = (~a) & 0xFF;

  setFlag("CF", 0);
  updateArithmeticFlags(result);

  return result;
}

/*** Compara dos valores sin guardar el resultado.*/
function CMP(a, b) {
  const fullResult = a - b;
  const result = fullResult & 0xFF;

  setFlag("CF", fullResult < 0 ? 1 : 0);
  updateArithmeticFlags(result);
}
