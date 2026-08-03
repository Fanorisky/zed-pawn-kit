const PREC = {
  assignment: 1,
  ternary: 2,
  logical_or: 3,
  logical_and: 4,
  bitwise_or: 5,
  bitwise_xor: 6,
  bitwise_and: 7,
  equality: 8,
  comparison: 9,
  shift: 10,
  additive: 11,
  multiplicative: 12,
  unary: 13,
  postfix: 14,
  call: 15,
};

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}

module.exports = grammar({
  name: 'pawn',

  extras: $ => [/[\s\uFEFF\u2060\u200B]/, $.comment],
  word: $ => $.identifier,

  supertypes: $ => [
    $._expression,
    $._statement,
    $._declaration,
  ],

  conflicts: $ => [
    [$.function_definition, $.primary_expression],
    [$.block, $.array_literal],
    [$.tagged_type, $.label_statement],
    [$.function_modifier, $.global_variable_declaration, $.variable_declaration],
    [$.global_variable_declaration, $.variable_declaration],
    [$.variable_declarator, $.primary_expression],
  ],

  rules: {
    source_file: $ => repeat($._top_level),

    _top_level: $ => choice(
      $.preprocessor,
      $.function_definition,
      $.function_declaration,
      $.enum_declaration,
      $.global_variable_declaration,
      $.statement,
    ),

    // Preprocessor directives are line-oriented in Pawn. The specialized
    // rules preserve useful structure for includes and macro definitions,
    // while the fallback keeps compiler-specific directives parseable.
    preprocessor: $ => choice(
      $.preproc_include,
      $.preproc_define,
      $.preproc_undef,
      $.preproc_conditional,
      $.preproc_diagnostic,
      $.preproc_directive,
    ),

    preproc_include: $ => seq(
      '#',
      choice('include', 'tryinclude'),
      choice($.system_lib_string, $.string_literal, $.identifier),
    ),

    preproc_define: $ => seq(
      '#',
      'define',
      field('name', $.identifier),
      optional(field('value', /[^\r\n]*/)),
    ),

    preproc_undef: $ => seq('#', 'undef', field('name', $.identifier), optional(/[^\r\n]*/)),

    preproc_conditional: $ => seq(
      '#',
      choice('if', 'elseif', 'else', 'endif', 'ifdef', 'ifndef'),
      optional(field('condition', /[^\r\n]*/)),
    ),

    preproc_diagnostic: $ => seq(
      '#',
      choice('assert', 'error', 'warning', 'pragma', 'emit', 'endinput'),
      optional(field('body', /[^\r\n]*/)),
    ),

    preproc_directive: $ => seq(
      '#',
      field('directive', $.identifier),
      optional(field('body', /[^\r\n]*/)),
    ),

    // Functions
    function_definition: $ => seq(
      field('modifiers', repeat($.function_modifier)),
      optional(field('return_type', $.type)),
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      field('body', $.block),
    ),

    function_declaration: $ => seq(
      field('modifiers', repeat1($.function_modifier)),
      optional(field('return_type', $.type)),
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      ';',
    ),

    function_modifier: $ => choice(
      'public',
      'forward',
      'native',
      'stock',
      'static',
      'inline',
      'hook',
      'task',
      'ptask',
      'const',
    ),

    parameter_list: $ => seq('(', commaSep(choice($.parameter_declaration, $.rest_parameter)), ')'),

    rest_parameter: $ => '...',

    parameter_declaration: $ => seq(
      optional('const'),
      optional('&'),
      optional(field('type', $.tagged_type)),
      field('name', $.identifier),
      repeat($.dimension),
      optional(seq('=', field('default_value', $._expression))),
    ),

    // Types and declarations
    type: $ => choice($.builtin_type, $.tagged_type, $.identifier),

    builtin_type: $ => choice(
      'void',
      'bool',
      'char',
      'int',
      'float',
      'any',
    ),

    tagged_type: $ => seq(
      field('tag', $.identifier),
      ':',
    ),

    global_variable_declaration: $ => seq(
      repeat(choice('static', 'stock', 'const')),
      'new',
      commaSep1($.variable_declarator),
      ';',
    ),

    variable_declaration: $ => seq(
      repeat(choice('static', 'stock', 'const')),
      'new',
      commaSep1($.variable_declarator),
      ';',
    ),

    variable_declarator: $ => seq(
      optional(field('type', $.tagged_type)),
      field('name', $.identifier),
      repeat($.dimension),
      optional(seq('=', field('value', $._expression))),
    ),

    enum_declaration: $ => seq(
      'enum',
      optional(field('name', $.identifier)),
      '{',
      commaSep($.enum_entry),
      optional(','),
      '}',
      ';',
    ),

    enum_entry: $ => seq(
      optional(field('type', $.tagged_type)),
      field('name', $.identifier),
      optional(seq('=', field('value', $._expression))),
    ),

    dimension: $ => seq('[', optional($._expression), ']'),

    // Statements
    _statement: $ => choice(
      $.block,
      $.variable_declaration,
      $.if_statement,
      $.for_statement,
      $.foreach_statement,
      $.while_statement,
      $.do_while_statement,
      $.switch_statement,
      $.return_statement,
      $.jump_statement,
      $.assert_statement,
      $.label_statement,
      $.expression_statement,
      $.empty_statement,
    ),

    statement: $ => $._statement,

    block: $ => seq('{', repeat(choice($._statement, $._declaration)), '}'),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $._statement),
      optional(seq('else', field('alternative', $._statement))),
    )),

    for_statement: $ => seq(
      'for',
      '(',
      optional(choice($.for_initializer, $._expression)),
      ';',
      optional($._expression),
      ';',
      optional($._expression),
      ')',
      $._statement,
    ),

    for_initializer: $ => seq(
      optional('new'),
      commaSep1($.variable_declarator),
    ),

    foreach_statement: $ => seq(
      'foreach',
      '(',
      optional('new'),
      field('variable', $.identifier),
      ':',
      field('collection', $._expression),
      ')',
      $._statement,
    ),

    while_statement: $ => seq('while', $.parenthesized_expression, $._statement),

    do_while_statement: $ => seq(
      'do',
      $._statement,
      'while',
      $.parenthesized_expression,
      ';',
    ),

    switch_statement: $ => seq(
      'switch',
      $.parenthesized_expression,
      '{',
      repeat(choice($.case_clause, $.default_clause, $._statement)),
      '}',
    ),

    case_clause: $ => seq(
      'case',
      field('value', $._expression),
      ':',
    ),

    default_clause: $ => seq(
      'default',
      ':',
    ),

    return_statement: $ => seq('return', optional($._expression), ';'),

    jump_statement: $ => seq(
      choice('break', 'continue', 'goto', 'exit', 'sleep', 'state'),
      optional($._expression),
      ';',
    ),

    assert_statement: $ => seq('assert', optional($.parenthesized_expression), ';'),

    label_statement: $ => seq(field('name', $.identifier), ':', $._statement),

    expression_statement: $ => seq($._expression, ';'),
    empty_statement: $ => ';',

    _declaration: $ => choice(
      $.function_definition,
      $.function_declaration,
      $.enum_declaration,
      $.global_variable_declaration,
    ),

    // Expressions
    _expression: $ => choice(
      $.assignment_expression,
      $.ternary_expression,
      $.binary_expression,
      $.unary_expression,
      $.postfix_expression,
      $.call_expression,
      $.field_access,
      $.array_indexed_access,
      $.parenthesized_expression,
      $.sizeof_expression,
      $.tagof_expression,
      $.primary_expression,
    ),

    primary_expression: $ => choice(
      $.identifier,
      $.int_literal,
      $.float_literal,
      $.char_literal,
      $.string_literal,
      $.bool_literal,
      $.array_literal,
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    assignment_expression: $ => prec.right(PREC.assignment, seq(
      field('left', $._expression),
      choice('=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='),
      field('right', $._expression),
    )),

    ternary_expression: $ => prec.right(PREC.ternary, seq(
      field('condition', $._expression),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression),
    )),

    binary_expression: $ => choice(
      ...[
        ['||', PREC.logical_or],
        ['&&', PREC.logical_and],
        ['|', PREC.bitwise_or],
        ['^', PREC.bitwise_xor],
        ['&', PREC.bitwise_and],
        ['==', PREC.equality],
        ['!=', PREC.equality],
        ['<>', PREC.equality],
        ['<', PREC.comparison],
        ['>', PREC.comparison],
        ['<=', PREC.comparison],
        ['>=', PREC.comparison],
        ['<<', PREC.shift],
        ['>>', PREC.shift],
        ['+', PREC.additive],
        ['-', PREC.additive],
        ['*', PREC.multiplicative],
        ['/', PREC.multiplicative],
        ['%', PREC.multiplicative],
      ].map(([operator, precedence]) => prec.left(precedence, seq(
        field('left', $._expression),
        operator,
        field('right', $._expression),
      )))
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      choice('!', '~', '-', '+', '++', '--', '&'),
      $._expression,
    )),

    postfix_expression: $ => prec.left(PREC.postfix, seq(
      $._expression,
      choice('++', '--'),
    )),

    call_expression: $ => prec.left(PREC.call, seq(
      field('function', $._expression),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq('(', commaSep(choice($._expression, $.rest_argument)), ')'),
    rest_argument: $ => '...',

    field_access: $ => prec.left(PREC.call, seq(
      field('object', $._expression),
      choice('.', '->'),
      field('field', $.identifier),
    )),

    array_indexed_access: $ => prec.left(PREC.call, seq(
      field('array', $._expression),
      field('index', $.dimension),
    )),

    sizeof_expression: $ => prec(PREC.unary, seq(
      'sizeof',
      choice($.parenthesized_expression, $.identifier),
    )),

    tagof_expression: $ => prec(PREC.unary, seq(
      'tagof',
      choice($.parenthesized_expression, $.identifier),
    )),

    array_literal: $ => seq('{', commaSep($._expression), optional(','), '}'),

    // Lexical rules based on the kit's C/Pawn TextMate grammar.
    comment: $ => choice(
      token(seq('//', /[^\r\n]*/)),
      token(seq('/*', repeat(choice(/[^*]/, /\*[^/]/)), '*/')),
    ),

    system_lib_string: $ => seq('<', /[^>\r\n]+/, '>'),

    string_literal: $ => seq(
      '"',
      repeat(choice($.escape_sequence, /[^"\\\r\n]/)),
      '"',
    ),

    char_literal: $ => seq(
      "'",
      choice($.escape_sequence, /[^'\\\r\n]/),
      "'",
    ),

    escape_sequence: $ => token(/\\(?:[abefnprtv'"?\\]|[0-7]{1,3}|x[0-9a-fA-F]{1,2})/),

    bool_literal: $ => choice('true', 'false', 'TRUE', 'FALSE'),

    float_literal: $ => token(/(?:[0-9]+\.[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?/),
    int_literal: $ => token(/(?:0[xX][0-9a-fA-F]+|0[bB][01]+|[0-9]+)/),

    identifier: $ => /[A-Za-z_@][A-Za-z0-9_@]*/,
  },
});
