export default class Cell {
  constructor(id, value) {
    this.id = id;
    this.value = value;
    this.prefilled = true;
    this.incorrect = false;
  }
}
