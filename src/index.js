import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cell from "./components/Cell/cell";
import "./styles/index.css";

class Neighbors extends Component {
  render() {
    return (
      <table>
        <tbody>
          <tr>
            <Square
              squares={this.props.squares[0]}
              handleChange={this.props.onChange}
            />
            <Square
              squares={this.props.squares[1]}
              handleChange={this.props.onChange}
            />
            <Square
              squares={this.props.squares[2]}
              handleChange={this.props.onChange}
            />
          </tr>
          <tr>
            <Square
              squares={this.props.squares[3]}
              handleChange={this.props.onChange}
            />
            <Square
              squares={this.props.squares[4]}
              handleChange={this.props.onChange}
            />
            <Square
              squares={this.props.squares[5]}
              handleChange={this.props.onChange}
            />
          </tr>
          <tr>
            <Square
              squares={this.props.squares[6]}
              handleChange={this.props.onChange}
            />
            <Square
              squares={this.props.squares[7]}
              handleChange={this.props.onChange}
            />
            <Square
              squares={this.props.squares[8]}
              handleChange={this.props.onChange}
            />
          </tr>
        </tbody>
      </table>
    );
  }
}

class Square extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.squares.id,
      value: props.squares.value,
      prefilled: props.squares.prefilled,
    };
  }

  doChange(e) {
    this.setState({
      value: e.target.value,
    });
    this.props.handleChange(e.target.value, e.target.id);
  }

  render() {
    let className = this.state.prefilled
      ? "square square-grey"
      : "square square-white";
    if (this.props.squares.incorrect) {
      className = "square square-red";
    }

    return (
      <td>
        <div className={className}>
          <input
            inputMode="numeric"
            size="2"
            maxLength="1"
            type="text"
            autoComplete="off"
            onChange={this.doChange.bind(this)}
            value={this.props.squares.value || ""}
            id={this.state.id}
            disabled={this.state.prefilled}
          />
        </div>
      </td>
    );
  }
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.filledSquares = 81;
    let board = this.generateBoard(Array());
    let edgeBoard = JSON.parse(JSON.stringify(board));
    this.state = {
      incorrectValues: [],
      correctBoard: board,
      history: [
        {
          squares: this.removeSquares(edgeBoard),
        },
      ],
      stepNumber: 0,
      filledSquares: this.filledSquares,
      wrongAttempts: 0,
      showModal: false,
    };
  }

  undo() {
    let step = this.state.stepNumber;
    if (step > 0) {
      this.state.history.pop();
      this.setState({
        stepNumber: step - 1,
        filledSquares: this.state.filledSquares - 1,
        history: this.state.history,
      });
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    return (
      <div align="center">
        <h1>Sudoku</h1>
        <Column
          squares={current.squares.slice(0, 27)}
          handleChange={this.handleChange.bind(this)}
        />
        <Column
          squares={current.squares.slice(27, 54)}
          handleChange={this.handleChange.bind(this)}
        />
        <Column
          squares={current.squares.slice(54, 81)}
          handleChange={this.handleChange.bind(this)}
        />
        <div>
          <button onClick={() => this.undo()}>Undo</button>
          <button onClick={() => this.solveSolution()}>Solve</button>
        </div>
      </div>
    );
  }

  handleChange(value, id) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let squares = JSON.parse(JSON.stringify(current.squares));
    squares[id].value = Number(value) ? Number(value) : null;
    const backTrackTest = JSON.parse(JSON.stringify(squares));
    let ourFilledSquares = Number(value)
      ? this.state.filledSquares + 1
      : this.state.filledSquares - 1;
    if (squares[id].value < 10 && value !== "0" && !isNaN(Number(value))) {
      if (
        squares[id].value !== null &&
        (!this.validSpace(backTrackTest, id, squares[id].value) ||
          !this.backTracking(backTrackTest))
      ) {
        squares[id].incorrect = true;
        this.setState((prevState) => {
          const wrongAttempts = prevState.wrongAttempts + 1;
          if (wrongAttempts >= 3) {
            alert("3 wrong attempts! Game over. Starting a new game...");
            window.location.reload();
          }
          return { wrongAttempts };
        });
      }

      if (squares[id].value === null) {
        squares[id].incorrect = false;
      }

      this.setState({
        history: history.concat([
          {
            squares: squares,
          },
        ]),
        stepNumber: history.length,
        filledSquares: ourFilledSquares,
        solved: false,
      });
    }
  }

  usedInCol(squares, index, target) {
    let baseIndex = Math.floor(index / 27) * 27 + (index % 3);
    for (let i = baseIndex; i < baseIndex + 27; i += 3) {
      if (
        index != i &&
        squares[i] &&
        squares[i].value === target &&
        target &&
        i !== index
      ) {
        return true;
      }
    }
    return false;
  }

  usedInSquare(squares, index, target) {
    let baseIndex = Math.floor(index / 9) * 9;
    for (let i = baseIndex; i < baseIndex + 9; i++) {
      if (
        index != i &&
        squares[i] &&
        squares[i].value === target &&
        target &&
        index !== i
      ) {
        return true;
      }
    }
    return false;
  }

  incorrectBoardCheck(squares) {
    for (let i = 0; i < 81; i++) {
      if (squares[i].incorrect) {
        return true;
      }
    }
    return false;
  }

  solveSolution() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const squares = JSON.parse(JSON.stringify(current.squares));
    if (this.backTracking(squares) && !this.incorrectBoardCheck(squares)) {
      this.setState({
        history: history.concat([
          {
            squares: squares,
          },
        ]),
        stepNumber: history.length,
        filledSquares: 81,
        solved: true,
      });
      return true;
    } else {
      return false;
    }
  }

  usedInRow(squares, index, target) {
    let baseIndex = 3 * Math.floor(index / 3) - 27 * Math.floor(index / 27);
    for (let i = 0; i < 9; i++) {
      let adjustedIndex = baseIndex + (i % 3) + Math.floor(i / 3) * 27;
      if (
        squares[adjustedIndex] &&
        squares[adjustedIndex].value === target &&
        target
      ) {
        return true;
      }
    }
    return false;
  }

  usedInCompletedRow(squares, index, target) {
    let baseIndex = 3 * Math.floor(index / 3) - 27 * Math.floor(index / 27);
    for (let i = 0; i < 9; i++) {
      let adjustedIndex = baseIndex + (i % 3) + Math.floor(i / 3) * 27;
      if (
        index != adjustedIndex &&
        squares[adjustedIndex] &&
        squares[adjustedIndex].value === target &&
        target
      ) {
        return true;
      }
    }
    return false;
  }

  initializeEmptylist(squares) {
    for (let i = 0; i < 81; i++) {
      squares[i] = new Cell(i, null);
    }
  }

  backTracking(squares) {
    const index = this.findUnassignedLocation(squares);
    if (index < 0) {
      return true;
    }
    for (let i = 1; i < 10; i++) {
      if (this.isSafeCell(squares, index, i)) {
        squares[index].value = i;

        if (this.backTracking(squares)) {
          return true;
        }

        squares[index].value = null;
      }
    }
    return false;
  }

  findUnassignedLocation(squares) {
    for (let i = 0; i < 81; i++) {
      if (squares[i].value == null) {
        return i;
      }
    }
    return -1;
  }

  isSafeCell(squares, index, target) {
    if (
      this.usedInCol(squares, index, target) ||
      this.usedInSquare(squares, index, target) ||
      this.usedInRow(squares, index, target)
    ) {
      return false;
    }
    return true;
  }

  checkSolution() {
    const current = this.state.history[this.state.stepNumber].squares;
    for (let i = 0; i < 81; i++) {
      if (!this.isSafeCell(current, i, current[i].value)) {
        return false;
      }
    }
    return true;
  }

  generateBoard(squares) {
    this.initializeEmptylist(squares);
    this.fillSquare(squares, 0);
    this.fillSquare(squares, 36);
    this.fillSquare(squares, 72);
    this.backTracking(squares);
    return squares;
  }

  removeSquares(squares) {
    for (let i = 0; i < 81; i++) {
      let random = Math.floor(Math.random() * 81);
      if (random > 33) {
        squares[i].value = null;
        squares[i].prefilled = false;
        this.filledSquares -= 1;
      }
    }
    return squares;
  }

  fillSquare(squares, index) {
    for (let i = 0; i < 9; i++) {
      let random;
      do {
        random = Math.floor(Math.random() * 9 + 1);
      } while (!this.isSafeCell(squares, index, random));
      squares[index + i].value = random;
    }
  }

  validSpace(squares, index, random) {
    if (
      this.usedInCompletedRow(squares, index, random) ||
      this.usedInCol(squares, index, random) ||
      this.usedInSquare(squares, index, random)
    ) {
      return false;
    }
    return true;
  }
}

class Column extends Component {
  render() {
    return (
      <div className="column">
        <Neighbors
          squares={this.props.squares.slice(0, 9)}
          onChange={this.props.handleChange}
        />
        <Neighbors
          squares={this.props.squares.slice(9, 18)}
          onChange={this.props.handleChange}
        />
        <Neighbors
          squares={this.props.squares.slice(18, 27)}
          onChange={this.props.handleChange}
        />
      </div>
    );
  }
}

ReactDOM.render(<Board />, document.getElementById("root"));
