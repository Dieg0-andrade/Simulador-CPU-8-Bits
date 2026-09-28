const CPU = {
  PC: 0,
  IR: 0,
  MAR: 0,
  MDR: 0,
  AX: 0,
  BX: 0
};

/**
 * Reinicia todos los registros del CPU.
 */
function resetCPU() {
  CPU.PC = 0;
  CPU.IR = 0;
  CPU.MAR = 0;
  CPU.MDR = 0;
  CPU.AX = 0;
  CPU.BX = 0;
}

/**
 * Obtiene el valor de un registro.
 */
function getRegister(registerName) {
  if (!(registerName in CPU)) {
    throw new Error("Registro inválido: " + registerName);
  }

  return CPU[registerName];
}

/**
 * Modifica el valor de un registro.
 */
function setRegister(registerName, value) {
  if (!(registerName in CPU)) {
    throw new Error("Registro inválido: " + registerName);
  }

  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new Error("Valor fuera del rango de 8 bits: " + value);
  }

  CPU[registerName] = value;
}
