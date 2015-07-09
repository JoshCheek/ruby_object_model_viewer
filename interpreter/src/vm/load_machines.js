"use strict";

module.exports = load
const Machine  = require("./machine")

// loaded this way to prevent modification to the sate from affecting the template
function load(target) {
  let machine = (name) => new Machine(world, load.normalize(name))
  target.main            = (world) => machine("main")
  target.ast             = (world) => machine("ast")
  target.ast_nil         = (world) => machine("ast.nil")
  target.true            = (world) => machine("ast.true")
  target.ast_false       = (world) => machine("ast.false")
  target.ast_expressions = (world) => machine("ast.expressions")
}

load.requireMachine = function(name) {
  const template = require("./machines/" + name)
  return normalize(template)
}

load.normalize = function(template) {
  // type / extends
  template.type = template.type || "concrete"
  if(template.type !== "concrete") throw(new Error(`Figure out type: ${template.type}`))
  if(template.extends)             throw(new Error("Figure out extends!"))

  // registers
  template.registers = template.registers || {}
  for(let name in registers) {
    attributes = registers[name]
    attributes.type = attributes.type || "any"

    let init = function(value) {
      if(attributes.init === undefined)
        attributes.init = value
    }

    if(attributes.type == "any"       ) init(null)
    if(attributes.type == "hash"      ) init({})
    if(attributes.type == "string"    ) init("")
    if(attributes.type == ["machine"] ) init([])
    if(attributes.type == "machine" && !attributes.init)
      throw(new Error("machines should probably always have an init value, idk what a null machine is"))
  }

  // states
  template.states = template.states || {}
  const states    = template.states
  states.finish   = states.finish || {}
  if(!states.start) throw(new Error("Probably all machines need a start state"))

  for(let name in states) {
    let state = states[name]
    state.setup = state.setup || []
    state.body  = state.body  || []
  }

  return template;
}
