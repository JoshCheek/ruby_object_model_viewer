export default () => {
  return {
    name: "ast.expressions",
    desc: "Interprets the ast for `false`",
    registers: {
      "@ast":        {type: "hash", init: {}, hide: true, arg: true},
      "@expression": {},
      "@node_type":  {type: "hash"},
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
          ["for_in", "@expression", "@expressions"],       // @expressions.each { |@expression|
          ["setKey", "@childArgs", "ast", "@expression"],  //   @childArgs.ast = @expressions
          ["initMachine", "@child", "@childArgs"],         //   @child.init @childArgs
          ["runMachine", "@child"],                        //   @child.run
          ["end"],                                         // end
          ["globalToRegister", "$returnValue", "@result"], // @result = $returnValue
          ["registerToGlobal", "@result", "$returnValue"], // $returnValue = @result (set it to declare that we resulted in a value)
          ["switchStateTo", "finished"],                   // "goto :finished"
        ]
      }
    }
  }
}

// @i = 0
// @length = @expressions.length
// label loop
//   @done = (@i == @length)
//   jump_to_if endloop, @done
//   @expression = @expressions[@i]
//   @childArgs[:ast] = @expressions
//   @child.init @childArgs
//   @child.run
//   @i++
// label endloop