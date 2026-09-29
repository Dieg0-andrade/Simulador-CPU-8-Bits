const CPU = {
  PC: 0,
  IR: 0,
  MAR: 0,
  MDR: 0,
  AX: 0,
  BX: 0,

  ZF: 0,
  CF: 0,
  SF: 0
};

/*** Reinicia todos los registros del CPU.*/
function resetCPU() {

  CPU.PC = 0;
  CPU.IR = 0;
  CPU.MAR = 0;
  CPU.MDR = 0;
  CPU.AX = 0;
  CPU.BX = 0;

  CPU.ZF = 0;
  CPU.CF = 0;
  CPU.SF = 0;

  const properties = PropertiesService.getScriptProperties();

  properties.setProperty("PC", "0");
  properties.setProperty("IR", "0");
  properties.setProperty("MAR", "0");
  properties.setProperty("MDR", "0");
  properties.setProperty("AX", "0");
  properties.setProperty("BX", "0");

  properties.setProperty("ZF", "0");
  properties.setProperty("CF", "0");
  properties.setProperty("SF", "0");
}


/*** Obtiene el valor de un registro.*/
function getRegister(registerName) {

  if (!(registerName in CPU)) {
    throw new Error("Registro inválido: " + registerName);
  }

  const properties = PropertiesService.getScriptProperties();

  const value = properties.getProperty(registerName);

  if (value === null) {
    return CPU[registerName];
  }

  return Number(value);
}


/*** Modifica el valor de un registro.*/
function setRegister(registerName, value) {

  if (!(registerName in CPU)) {
    throw new Error("Registro inválido: " + registerName);
  }

  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new Error("Valor fuera del rango de 8 bits: " + value);
  }

  CPU[registerName] = value;

  PropertiesService
    .getScriptProperties()
    .setProperty(
      registerName,
      String(value)
    );
}


/*** Obtiene el valor de una bandera.*/
function getFlag(flagName) {

  if (!["ZF", "CF", "SF"].includes(flagName)) {
    throw new Error("Bandera inválida: " + flagName);
  }

  const properties = PropertiesService.getScriptProperties();

  const value = properties.getProperty(flagName);

  if (value === null) {
    return CPU[flagName];
  }

  return Number(value);
}


/*** Modifica el valor de una bandera.*/
function setFlag(flagName, value) {

  if (!["ZF", "CF", "SF"].includes(flagName)) {
    throw new Error("Bandera inválida: " + flagName);
  }

  if (value !== 0 && value !== 1) {
    throw new Error("Una bandera solo puede valer 0 o 1");
  }

  CPU[flagName] = value;

  PropertiesService
    .getScriptProperties()
    .setProperty(
      flagName,
      String(value)
    );
}
