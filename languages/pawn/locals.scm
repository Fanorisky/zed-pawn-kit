; Function and block scopes
(function_definition) @local.scope
(block) @local.scope

; Definitions
(parameter_declaration
  name: (identifier) @local.definition)
(variable_declarator
  name: (identifier) @local.definition)

; References
(identifier) @local.reference
