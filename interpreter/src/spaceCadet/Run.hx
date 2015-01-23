package spaceCadet;

class TestFinished {
  public function new() {}
}

typedef ReporterOptions = {
  @:optional var failFast:Bool;
}

class Run {
  public static function withDefaults(?opts:ReporterOptions) {
    if(opts == null) opts = {};
    if(opts.failFast == null) opts.failFast = false;
    return opts;
  }

  public static function run(desc:Description, rep:Reporter, ?opts:ReporterOptions) {
    new Run(rep, opts)._run(desc, []);
  }

  private var reporter    : Reporter;
  private var opts        : ReporterOptions;
  private var haltTesting : Bool;

  public function new(reporter, ?opts:ReporterOptions) {
    this.opts     = withDefaults(opts);
    this.reporter = reporter;
  }

  private function _run(description:Description, beforeBlocks:Array<AssertBlock>) {
    var allBeforeBlocks = beforeBlocks.concat(description.beforeBlocks);
    for(testable in description.testables) {
      if(haltTesting) return;
      switch(testable) {
        case One(name, body):   runSpec(name, allBeforeBlocks, body);
        case Many(name, child): runDesc(name, allBeforeBlocks, child);
      }
    }
  }

  private function runSpec(name, beforeBlocks:Array<AssertBlock>, body) {
    reporter.declareSpec(name, function(reportAssertionPass, reportPass, reportPending, reportFailure) {
      var onFailure = function(msg, position) {
        if(opts.failFast) haltTesting = true;
        reportFailure(msg, position);
        throw new TestFinished();
      }

      var onPending = function(msg, position) {
        reportPending(msg, position);
        throw new TestFinished();
      }

      var asserter = new Asserter(
        reportAssertionPass,
        onFailure,
        onPending);

      try {
        for(block in beforeBlocks) block(asserter);
        body(asserter);
      } catch(_:TestFinished) {
        return;
      }

      reportPass();
    });
  }

  private function runDesc(name, beforeBlocks, description) {
    reporter.declareDescription(name, function() {
      _run(description, beforeBlocks);
    });
  }
}