"use strict";

import util from "util"
import {inspect} from "util"
import instructionCodes from "./instructions"

let doLog = false,
    log   = (pairs) => {
      if(!doLog) return
      console.log(
        "  " + Object.keys(pairs)
                     .map((key) => `\u001b[34m${key}:\u001b[0m ${inspect(pairs[key])}`)
                     .join(" | ")
      )
    },
    logStep = (world, machine, instructionName, instructionArgs) => {
      if(!doLog) return
      let stackNames = [], stackMachine = world.$machineStack

      while(stackMachine) {
        stackNames.push(stackMachine.fullname())
        stackMachine = stackMachine.state.parent
      }

      console.log(`\n\u001b[35mSTACK: \u001b[0m${stackNames.join(", ")}`)
      console.log(`\u001b[44;37m---- ${machine.fullname()} ${machine.instructionPointer()}:${instructionName} ${inspect(instructionArgs)} ---------------------------------------------------\u001b[0m`)
    }

export default class Machine {
  constructor(world, state, parent) {
    this.world               = world
    this.state               = state
  }

  child(name, parent) {
    const definition = this.state.children[name]
    if(!definition) throw(new Error(
      `No child ${inspect(name)} for ${inspect(this.name())}, only have: ${Object.keys(this.state.children).map(inspect).join(", ")}`
    ))

    let machine = new Machine(this.world, definition)
    machine.state.parent             = parent
    machine.state.instructionPointer = 0
    machine.state.registers          = {}
    return machine
  }

  step() {
    if(this.isFinished()) throw(new Error(`${this.name()} is finished!`))

    const instruction = this.getInstruction(),
          name        = instruction[0],
          args        = instruction.slice(1),
          code        = instructionCodes[name]

    logStep(this.world, this, name, args)
    log({preRegisters: this.state.registers})

    if(!code)
      throw(new Error(`No instruction: ${name}`))
    else
      code(this.world, this.state, this, this.state.registers, ...args)


    this.state.instructionPointer = this.instructionPointer() + 1

    log({
      name:                   this.name(),
      postFinished:           this.isFinished(),
      postInstructionPointer: this.instructionPointer(),
      postRegisters:          this.state.registers,
      foundExpression:        this.world.$foundExpression,
    })
  }

  // -----  Private  -----

  name() {
    return this.state.name
  }

  getInstruction() {
    return this.state.instructions[this.instructionPointer()]
  }

  instructionPointer() {
    if(this.state.instructionPointer < 0)
      this.state.instructionPointer = 0
    return this.state.instructionPointer
  }

  isFinished() {
    return !this.getInstruction()
  }

  fullname() {
    let ns = this.state.namespace.slice(0)
    ns.unshift("")
    ns.push(this.name())
    return ns.join('/')
  }
}
