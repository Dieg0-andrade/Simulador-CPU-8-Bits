function testMemory() {
  Write(128, 10);
  Write(129, 25);
  Write(130, 255);

  Logger.log(Read(128));
  Logger.log(Read(129));
  Logger.log(Read(130));
}
