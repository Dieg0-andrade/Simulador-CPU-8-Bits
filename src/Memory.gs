const RAM_SHEET = "RAM";
const RAM_SIZE = 256;

/**
 * Lee un byte de una dirección de memoria.
 * address debe estar entre 0 y 255.
 */
function Read(address) {
  validateAddress(address);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RAM_SHEET);
  const row = address + 2;
  const hexValue = sheet.getRange(row, 2).getDisplayValue();

  return parseInt(hexValue || "0", 16);
}

/**
 * Escribe un byte en una dirección de memoria.
 * address debe estar entre 0 y 255.
 * value debe estar entre 0 y 255.
 */
function Write(address, value) {
  validateAddress(address);
  validateByte(value);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RAM_SHEET);
  const row = address + 2;
  const hexValue = value
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");

  sheet.getRange(row, 2).setValue(hexValue);
}

/**
 * Verifica que una dirección pertenezca a la RAM.
 */
function validateAddress(address) {
  if (!Number.isInteger(address) || address < 0 || address >= RAM_SIZE) {
    throw new Error("Dirección de memoria inválida: " + address);
  }
}

/**
 * Verifica que un valor pueda almacenarse en 8 bits.
 */
function validateByte(value) {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new Error("Valor fuera del rango de 8 bits: " + value);
  }
}
