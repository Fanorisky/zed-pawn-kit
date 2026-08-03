; Functions
(function_definition
  name: (identifier) @name) @definition.function
(function_declaration
  name: (identifier) @name) @definition.function

; Variables
(global_variable_declaration
  (variable_declarator
    name: (identifier) @name) @definition.variable)
(variable_declaration
  (variable_declarator
    name: (identifier) @name) @definition.variable)

; Enums and entries
(enum_declaration
  name: (identifier) @name) @definition.class
(enum_entry
  name: (identifier) @name) @definition.constant

; Preprocessor macros
(preproc_define
  name: (identifier) @name) @definition.macro

; Function calls
(call_expression
  function: (identifier) @name) @reference.call
(call_expression
  function: (field_access
    field: (identifier) @name)) @reference.call
