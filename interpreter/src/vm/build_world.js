"use strict";

const defineMachine = require("./machine_definitions")

export default function buildWorld(ast) {
  // All Objects
  let nextObjectId = 1
  const allObjects = {
    track: function(toTrack) {
      allObjects[nextObjectId] = toTrack
      toTrack.objectId = nextObjectId
      ++nextObjectId
      return toTrack
    }
  }


  // helpers
  const instantiate = function(klass, customInspect) {
    if(!customInspect) customInspect = function() { return `#<${klass.inspect()}:${this.objectId}>` }
    const instance = { class: klass.objectId, instanceVariables: {}, inspect: customInspect }
    allObjects.track(instance)
    if(klass.internalInit)
      klass.internalInit(instance)
    return instance
  }

  // BasicObject, Object, Class
  const rClass  = allObjects.track({
    instanceVariables: {},
    inspect: () => "rClass"
  })
  rClass.class = rClass

  const rBasicObject = allObjects.track({
    class:             rClass,
    instanceVariables: {},
    inspect:           () => "rBasicObject",
  })

  const rObject = allObjects.track({
    class:             rClass,
    instanceVariables: {},
    inspect:           () => "rObject",
  })

  rClass.internalInit = function(newClass) {
    newClass.constants       = {}
    newClass.instanceMethods = {}
    newClass.superclass      = rObject
  }

  rClass.internalInit(rBasicObject)
  rClass.internalInit(rObject)
  rClass.internalInit(rClass)

  // nil
  const rNilClass = instantiate(rClass,    () => "rNilClass")
  const rNil      = instantiate(rNilClass, () => "rNil")

  // true
  const rTrueClass = instantiate(rClass,     () => "rTrueClass")
  const rTrue      = instantiate(rTrueClass, () => "rTrue")

  // false
  const rFalseClass = instantiate(rClass,      () => "rFalseClass")
  const rFalse      = instantiate(rFalseClass, () => "rFalse")

  // String
  const rString     = instantiate(rClass,      () => "rString")

  // callstack
  const main = instantiate(rObject, () => "rMain")
  const toplevelBinding = {
    localVariables: {},
    self:           main,
    returnValue:    rNil,
  }

  // constants
  const toplevelNamespace = rObject
  toplevelNamespace.constants["TOPLEVEL_BINDING"] = toplevelBinding
  toplevelNamespace.constants["BasicObject"]      = rBasicObject
  toplevelNamespace.constants["Object"]           = rObject
  toplevelNamespace.constants["Class"]            = rClass
  toplevelNamespace.constants["String"]           = rString
  toplevelNamespace.constants["NilClass"]         = rNilClass
  toplevelNamespace.constants["TrueClass"]        = rTrueClass
  toplevelNamespace.constants["FalseClass"]       = rFalseClass

  // put it all together
  const world = {
    $ast:               ast,
    $rNil:              rNil,
    $rTrue:             rTrue,
    $rFalse:            rFalse,
    $rString:           rString,
    $rObject:           rObject,
    $toplevelNamespace: toplevelNamespace,
    $deftargetStack:    toplevelNamespace, // which class/method `def` will add the method to
    $bindingStack:      toplevelBinding,
    $rTOPLEVEL_BINDING: toplevelBinding,
    $rMain:             main,
    $allObjects:        allObjects,
    $foundExpression:   false,
  }

  // not quite right, should be a data structure, not an object.
  world.$rootMachine  = defineMachine()
  world.$machineStack = {
    definition         : world.$rootMachine.children["main"],
    parent             : null,
    registers          : {},
    instructionPointer : 0,
  }

  return world
}
