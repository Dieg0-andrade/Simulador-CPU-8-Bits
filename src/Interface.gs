function updateCPUInterface() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  const registers = ["PC", "IR", "MAR", "MDR", "AX", "BX"];

  for (let i = 0; i < registers.length; i++) {
    const register = registers[i];
    const value = getRegister(register);

    const hexValue = value
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");

    sheet.getRange(i + 3, 1).setValue(register);
    sheet.getRange(i + 3, 2).setNumberFormat("@").setValue(hexValue);
  }
}
function updateFlagsInterface() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("CPU");

  if (!sheet) {
    throw new Error("No existe la hoja CPU");
  }

  const flags = ["ZF", "CF", "SF"];

  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];

    sheet.getRange(i + 3, 4).setValue(flag);
    sheet.getRange(i + 3, 5).setValue(getFlag(flag));
  }
}
