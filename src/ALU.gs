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
