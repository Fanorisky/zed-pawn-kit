; Generic identifiers are the fallback; specific roles below take precedence.
(identifier) @variable

; Definitions, references, and calls
(function_definition name: (identifier) @function.definition)
(function_declaration name: (identifier) @function.definition)
(field_access field: (identifier) @property)
(call_expression
  function: (field_access
    field: (identifier) @function.method))
(call_expression
  function: (primary_expression
    (identifier) @function))
(label_statement name: (identifier) @label)

; Parameters and variables
(parameter_declaration name: (identifier) @variable.parameter)
(variable_declarator name: (identifier) @variable)

; Types, tags, enums, and constants
(builtin_type) @type.builtin
(tagged_type
  tag: (identifier) @type
  ":" @type)
(type (identifier) @type)
(enum_declaration name: (identifier) @type)
(enum_entry name: (identifier) @constant)

; Preprocessor directives
(preproc_include
  "#" @punctuation.special
  ["include" "tryinclude"] @keyword)
(preproc_define
  "#" @punctuation.special
  "define" @keyword
  name: (identifier) @constant)
(preproc_undef
  "#" @punctuation.special
  "undef" @keyword
  name: (identifier) @constant)
(preproc_conditional
  "#" @punctuation.special
  ["if" "elseif" "else" "endif" "ifdef" "ifndef"] @keyword)
(preproc_diagnostic
  "#" @punctuation.special
  ["assert" "error" "warning" "pragma" "emit" "endinput"] @keyword)
(preproc_directive
  "#" @punctuation.special
  directive: (identifier) @keyword)
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

["sizeof" "tagof"] @operator

; Context-sensitive punctuation
(ternary_expression ["?" ":"] @operator)
(case_clause ":" @punctuation.delimiter)
(default_clause ":" @punctuation.delimiter)
(label_statement ":" @punctuation.delimiter)

; Operators and punctuation
[
  "=" "+=" "-=" "*=" "/=" "%=" "&=" "|=" "^=" "<<=" ">>="
  "+" "-" "*" "/" "%" "++" "--"
  "==" "!=" "<>" "<" ">" "<=" ">="
  "!" "&&" "||" "&" "|" "~" "^" "<<" ">>"
 ] @operator

["." "->" ","] @punctuation.delimiter
(dimension
  "[" @punctuation.bracket
  "]" @punctuation.bracket)
(array_literal
  "{" @punctuation.bracket
  "}" @punctuation.bracket)

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

; `using` is matched by text so cached grammars without the newer token
; can still compile this query while the updated grammar is downloaded.
((_) @keyword
  (#match? @keyword "^using$"))

; Task tags in comments, matching the PocketPawn TextMate grammar.
((comment) @text.todo
  (#match? @text.todo "(^|[^A-Za-z0-9_])@?TODO\\b"))
((comment) @text.note
  (#match? @text.note "(^|[^A-Za-z0-9_])@?(TBD|REVIEW|NOTE|NB|CHANGED|IDEA|IMPORTANT|HACK)\\b"))
((comment) @text.warning
  (#match? @text.warning "(^|[^A-Za-z0-9_])@?(FIXME|XXX|WTF|WARNING|BUG)\\b"))
