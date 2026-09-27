# Arquitectura del Simulador de CPU de 8 bits

## Descripción general
El proyecto implementa un simulador educativo de una CPU de 8 bits basado en la arquitectura de Von Neumann.
El sistema estará dividido en módulos independientes para representar los principales componentes de una computadora: CPU, Unidad de Control, ALU, registros y memoria principal.
La ejecución de las instrucciones seguirá el ciclo:

**Fetch → Decode → Execute → Store**

## Componentes principales

### CPU

La CPU representa el estado interno del procesador y contiene los registros necesarios para ejecutar las instrucciones.
Registros:
- PC (Program Counter)
- IR (Instruction Register)
- MAR (Memory Address Register)
- MDR/MBR (Memory Data Register)
- AX/AC (Accumulator)
- BX

Banderas:
- ZF (Zero Flag)
- CF (Carry Flag)
- SF (Sign Flag)

La lógica correspondiente a estos componentes se implementará principalmente en `CPU.gs`.

### Unidad de Control
La Unidad de Control coordinará la ejecución de las instrucciones y las diferentes fases del ciclo de instrucción.
Sus principales responsabilidades serán:
- Realizar la fase Fetch.
- Decodificar las instrucciones.
- Coordinar la ejecución.
- Controlar el almacenamiento de resultados.
- Modificar el PC cuando corresponda.
- Coordinar los saltos del programa.

Su implementación estará ubicada en `ControlUnit.gs`.

### ALU

La Unidad Aritmético-Lógica será responsable de realizar las operaciones aritméticas y lógicas del procesador.
Operaciones previstas:
- ADD
- SUB
- INC
- DEC
- AND
- OR
- XOR
- NOT
- CMP

La ALU también actualizará las banderas ZF, CF y SF según los resultados de las operaciones.
Su implementación estará ubicada en `ALU.gs`.

### Memoria RAM

La memoria principal tendrá una capacidad de 256 bytes.
Características:
- Direcciones desde 00h hasta FFh.
- Cada posición almacena 8 bits.
- Lectura mediante una operación Read(address).
- Escritura mediante una operación Write(address, value).
- Separación visual entre código y datos.

Su implementación estará ubicada en `Memory.gs`.

### Interfaz

Google Sheets funcionará como interfaz visual del simulador.
Permitirá visualizar:
- Memoria RAM.
- Registros.
- Banderas.
- Fase actual del ciclo de instrucción.
- Log de micro-operaciones.

También contendrá los controles:
- STEP
- RUN
- PAUSE
- RESET
- LOAD PROGRAM

La comunicación entre Google Sheets y la lógica del simulador estará gestionada desde `Interface.gs`.

## Ciclo de instrucción

Cada instrucción será procesada mediante cuatro fases principales:
1. **Fetch:** búsqueda de la instrucción en memoria.
2. **Decode:** interpretación del opcode y los operandos.
3. **Execute:** ejecución de la operación correspondiente.
4. **Store:** almacenamiento del resultado cuando sea necesario.

## Organización modular

El proyecto estará organizado de la siguiente manera:
- `Main.gs`: inicialización y coordinación general.
- `CPU.gs`: registros y estado del procesador.
- `Memory.gs`: memoria RAM.
- `ALU.gs`: operaciones aritméticas y lógicas.
- `ControlUnit.gs`: ciclo de instrucción y control.
- `Interface.gs`: interacción con Google Sheets.

Esta separación permite mantener los componentes desacoplados y facilita futuras ampliaciones del simulador.
