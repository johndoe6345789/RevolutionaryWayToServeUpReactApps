export class Chip8 {
  readonly memory = new Uint8Array(4096);
  readonly registers = new Uint8Array(16);
  readonly display = new Uint8Array(64 * 32);
  programCounter = 0x200;
  index = 0;
  waitingRegister: number | null = null;
  changed = true;

  constructor(rom: number[]) {
    this.memory.set([0xf0, 0x90, 0x90, 0x90, 0xf0], 0x50);
    this.memory.set(rom, 0x200);
  }

  key(value: number): void {
    if (this.waitingRegister === null) return;
    this.registers[this.waitingRegister] = value & 0xf;
    this.waitingRegister = null;
    this.programCounter += 2;
  }

  run(cycles = 24): void {
    for (
      let count = 0;
      count < cycles && this.waitingRegister === null;
      count += 1
    )
      this.step();
  }

  private step(): void {
    const opcode =
      (this.memory[this.programCounter] << 8) |
      this.memory[this.programCounter + 1];
    const x = (opcode >> 8) & 0xf;
    const y = (opcode >> 4) & 0xf;
    const value = opcode & 0xff;
    const address = opcode & 0xfff;
    this.programCounter += 2;
    switch (opcode & 0xf000) {
      case 0x0000:
        if (opcode === 0x00e0) {
          this.display.fill(0);
          this.changed = true;
        }
        break;
      case 0x1000:
        this.programCounter = address;
        break;
      case 0x3000:
        if (this.registers[x] === value) this.programCounter += 2;
        break;
      case 0x4000:
        if (this.registers[x] !== value) this.programCounter += 2;
        break;
      case 0x6000:
        this.registers[x] = value;
        break;
      case 0x7000:
        this.registers[x] = (this.registers[x] + value) & 0xff;
        break;
      case 0xa000:
        this.index = address;
        break;
      case 0xc000:
        this.registers[x] = Math.floor(Math.random() * 256) & value;
        break;
      case 0xd000:
        this.draw(this.registers[x], this.registers[y], opcode & 0xf);
        break;
      case 0xf000:
        if ((opcode & 0xff) === 0x0a) {
          this.waitingRegister = x;
          this.programCounter -= 2;
        }
        break;
    }
  }

  private draw(startX: number, startY: number, rows: number): void {
    this.registers[0xf] = 0;
    for (let row = 0; row < rows; row += 1) {
      const sprite = this.memory[this.index + row];
      for (let bit = 0; bit < 8; bit += 1) {
        if ((sprite & (0x80 >> bit)) === 0) continue;
        const position = ((startY + row) % 32) * 64 + ((startX + bit) % 64);
        if (this.display[position]) this.registers[0xf] = 1;
        this.display[position] ^= 1;
      }
    }
    this.changed = true;
  }
}
