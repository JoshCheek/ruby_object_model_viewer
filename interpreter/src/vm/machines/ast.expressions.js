const machine = {
  name: "ast.expressions",
  desc: "Interprets the ast for `false`",
  registers: {
    "@ast":        {type: "hash", init: {}, hide: true, arg: true},
    "@expression": {},
    "@node_type":  {type: :"hash"},
    "@child":      {type: "machine", init: "ast"},
    "@childArgs":  {type: "hash", init: {}},
  },
  states: {
    start: {
      setup: [
        ["getKey", "@ast", "expressions", "@expressions"] // @expressions = @ast.expressions
      ]
    },
    running: {
      body: [
        ["for_in", "@expression", "@expressions"],      // @expressions.each { |@expression|
        ["getKey", "@childArgs", "ast", "@expression"], // @childArgs.ast = @expressions
        ["initMachine", "@child", "@childArgs"],        // @child.init @childArgs
        ["runMachine", "@child"],                       //   @child.run
        ["end"],                                        // end
        ["switchStateTo", "finished"],                  // "goto :finished"
      ]
    }
  }
}
