# Arquitectura del Simulador de CPU de 8 bits

## Descripción general

El proyecto implementa un simulador educativo de una CPU de 8 bits basado en la arquitectura de Von Neumann.

El sistema está dividido en módulos independientes que representan los principales componentes del procesador:

- CPU
- Unidad de Control
- ALU
- Registros
- Memoria RAM
- ISA
- Ensamblador
- Interfaz

La ejecución de las instrucciones sigue el ciclo:

**Fetch → Decode → Execute → Store**

---

## Componentes principales

### CPU

La CPU representa el estado interno del procesador y contiene los registros necesarios para ejecutar las instrucciones.

Registros:

- PC (Program Counter)
- IR (Instruction Register)
- MAR (Memory Address Register)
- MDR (Memory Data Register)
- AX
- BX

Banderas:

- ZF (Zero Flag)
- CF (Carry Flag)
- SF (Sign Flag)

Todos los registros trabajan con valores de 8 bits.

La lógica de estos componentes se encuentra principalmente en:

`CPU.gs`

---

### Unidad de Control

La Unidad de Control coordina la ejecución de las instrucciones y las diferentes fases del ciclo de instrucción.

Sus principales responsabilidades son:

- realizar la fase Fetch;
- interpretar el opcode;
- decodificar instrucciones;
- identificar operandos;
- coordinar la ejecución;
- controlar el almacenamiento de resultados;
- modificar el Program Counter;
- gestionar saltos y control de flujo.

Su implementación se encuentra en:

`ControlUnit.gs`

---

### ALU

La Unidad Aritmético-Lógica realiza las operaciones aritméticas y lógicas del procesador.

Operaciones implementadas:

- ADD
- SUB
- INC
- DEC
- CMP
- AND
- OR
- XOR
- NOT

La ALU también actualiza las banderas ZF, CF y SF según el resultado de las operaciones.

Su implementación se encuentra en:

`ALU.gs`

---

### Memoria RAM

La memoria principal tiene una capacidad de 256 bytes.

Características:

- direcciones desde `00H` hasta `FFH`;
- cada posición almacena 8 bits;
- lectura mediante `Read(address)`;
- escritura mediante `Write(address, value)`;
- separación visual entre código y datos.

La memoria se divide visualmente en:

- `00H - 7FH` → CODE
- `80H - FFH` → DATA

Su implementación se encuentra en:

`Memory.gs`

---

### ISA

El simulador utiliza una ISA propia para representar las instrucciones del procesador.

Cada instrucción define:

- opcode;
- mnemónico;
- cantidad de bytes;
- operandos;
- formato.

Las instrucciones pueden ocupar uno o dos bytes.

Su definición se encuentra en:

`ISA.gs`

---

### Ensamblador

El ensamblador convierte las instrucciones escritas en lenguaje ensamblador a bytes que pueden almacenarse en la memoria RAM.

Sus principales responsabilidades son:

- interpretar las instrucciones;
- validar operandos;
- identificar el opcode correspondiente;
- generar los bytes;
- calcular las direcciones del programa;
- cargar el programa en memoria.

Su implementación se encuentra en:

`Assembler.gs`

---

### Interfaz

Google Sheets funciona como interfaz visual del simulador.

Permite visualizar:

- memoria RAM;
- registros;
- banderas;
- fase actual;
- estado del CPU;
- instrucción actual;
- log de micro-operaciones.

También contiene los controles:

- STEP
- RUN
- PAUSE
- RESET
- LOAD PROGRAM

La comunicación entre Google Sheets y la lógica del simulador se gestiona desde:

`Interface.gs`

---

## Ciclo de instrucción

Cada instrucción es procesada mediante cuatro fases principales.

### Fetch

Se obtiene el opcode directamente desde memoria.

Las micro-operaciones principales son:

`PC → MAR`

`RAM[MAR] → MDR`

`MDR → IR`

`PC ← PC + 1`

Si la instrucción requiere un segundo byte, este también se obtiene desde RAM utilizando MAR y MDR.

### Decode

La Unidad de Control interpreta el opcode almacenado en IR y determina:

- la instrucción;
- la cantidad de bytes;
- los operandos;
- el tipo de operación.

### Execute

Se ejecuta la operación correspondiente.

Dependiendo de la instrucción pueden intervenir:

- ALU;
- registros;
- banderas;
- memoria;
- Program Counter.

### Store

El resultado se almacena en el registro o posición de memoria correspondiente.

---

## Flujo general de la arquitectura

```mermaid
flowchart LR

    RAM["Memoria RAM<br/>256 bytes"]
    CU["Unidad de Control"]
    REG["Registros<br/>PC IR MAR MDR AX BX"]
    ALU["ALU"]
    FLAGS["Banderas<br/>ZF CF SF"]
    UI["Interfaz<br/>Google Sheets"]
    ISA["ISA"]
    ASM["Ensamblador"]

    ISA --> ASM
    ISA --> CU

    ASM --> RAM

    RAM --> CU
    CU --> RAM

    CU --> REG
    REG --> CU

    REG --> ALU
    ALU --> REG

    ALU --> FLAGS
    FLAGS --> CU

    UI --> CU
    CU --> UI
