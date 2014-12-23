package ruby.ds;
import ruby.ds.objects.*;

// The container of all state (actually, instructions are currently stored in the interpreter)
typedef World = {
  public var objectSpace        : Array<RObject>;
  public var symbols            : InternalMap<RSymbol>;
  public var toplevelNamespace  : RClass;

  // interpreter state
  public var currentExpression  : RObject;

  // important objects
  public var toplevelBinding    : RBinding;
  public var main               : RObject;
  public var rubyNil            : RObject;
  public var rubyTrue           : RObject;
  public var rubyFalse          : RObject;

  // important classes
  public var klassClass         : RClass;
  public var moduleClass        : RClass;
  public var objectClass        : RClass;
  public var basicObjectClass   : RClass;
  public var stringClass        : RClass;
}
