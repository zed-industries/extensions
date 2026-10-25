; RGC syntax highlighting for Zed.
; Node names and field names follow the tree-sitter-rgc grammar.

(comment) @comment

(string) @string
(escape_sequence) @string.escape

(number) @number
(boolean) @boolean
(none) @constant.builtin

"if" @keyword
"elif" @keyword
"else" @keyword
"for" @keyword
"in" @keyword
"while" @keyword
"break" @keyword
"continue" @keyword
"pass" @keyword
"return" @keyword
"match" @keyword
"case" @keyword
"from" @keyword
"public" @keyword
"def" @keyword
"class" @keyword
"enum" @keyword
"interface" @keyword
"import" @keyword
"and" @keyword
"or" @keyword
"not" @keyword

(type) @type.builtin

(function_definition
  name: (identifier) @function)

(call_expression
  function: (identifier) @function)

(class_definition
  name: (identifier) @type)

(enum_definition
  name: (identifier) @type)

(interface_definition
  name: (identifier) @type)

(member_expression
  property: (identifier) @property)

(field_declaration
  name: (identifier) @property)

(binary_expression
  operator: _ @operator)

(assignment
  operator: _ @operator)

(unary_expression
  ["!" "-" "not"] @operator)

(borrow_type
  "@" @attribute
  "var" @attribute)

(borrow_expression
  "@" @attribute
  "var" @attribute)