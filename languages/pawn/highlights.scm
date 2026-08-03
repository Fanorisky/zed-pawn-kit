; Generic identifiers are the fallback; specific roles below take precedence.
(identifier) @variable

; Definitions and calls
(function_definition name: (identifier) @function)
(function_declaration name: (identifier) @function)
(call_expression function: (identifier) @function)
(call_expression function: (field_access field: (identifier) @function))
(field_access field: (identifier) @property)

; Parameters and variables
(parameter_declaration name: (identifier) @variable.parameter)
(variable_declarator name: (identifier) @variable)

; Types and tags
(builtin_type) @type.builtin
(tagged_type tag: (identifier) @type)
(type (identifier) @type)

; Preprocessor
(preprocessor) @preproc
(preproc_include) @include
(preproc_define) @preproc
(preproc_define name: (identifier) @constant)
(preproc_undef name: (identifier) @constant)
(system_lib_string) @string

; Statements and control flow
[
  "if"
  "else"
  "for"
  "foreach"
  "while"
  "do"
  "switch"
  "case"
  "default"
] @keyword

(for_statement) @keyword
(foreach_statement) @keyword
(while_statement) @keyword
(do_while_statement) @keyword
(switch_statement) @keyword
(ternary_expression) @keyword

; Pawn modifiers and language keywords
[
  "new"
  "const"
  "static"
  "stock"
  "public"
  "forward"
  "native"
  "inline"
  "hook"
  "task"
  "ptask"
  "enum"
  "return"
  "break"
  "continue"
  "goto"
  "exit"
  "sleep"
  "state"
  "assert"
] @keyword

["sizeof" "tagof"] @function.builtin

; Operators and punctuation
[
  "=" "+=" "-=" "*=" "/=" "%=" "&=" "|=" "^=" "<<=" ">>="
  "+" "-" "*" "/" "%" "++" "--"
  "==" "!=" "<>" "<" ">" "<=" ">="
  "!" "&&" "||" "&" "|" "~" "^" "<<" ">>"
  "?" ":"
] @operator

["." "->" ","] @punctuation.delimiter
(dimension) @punctuation.bracket
(array_literal) @punctuation.bracket

; Literals and comments
(comment) @comment
(string_literal) @string
(system_lib_string) @string
(char_literal) @character
(int_literal) @number
(float_literal) @number
(bool_literal) @constant.builtin
(escape_sequence) @string.escape

; Constants written in the conventional Pawn style.
((identifier) @constant
  (#match? @constant "^[A-Z][A-Z\\d_]+$"))

; Task tags in comments.
((comment) @text.todo
  (#match? @text.todo "^//[\\t ]*(TODO|FIXME)\\b|^/\\*[\\t ]*(TODO|FIXME)\\b"))
((comment) @text.note
  (#match? @text.note "^//[\\t ]*(NOTE|NB)\\b|^/\\*[\\t ]*(NOTE|NB)\\b"))
((comment) @text.warning
  (#match? @text.warning "^//[\\t ]*(WARNING|BUG)\\b|^/\\*[\\t ]*(WARNING|BUG)\\b"))
