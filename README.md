# Pawn support for the Zed Editor

This extension provides Pawn language support for Zed, based on the syntax and
file conventions from the `PocketPawn/kit` package.

## Supported files

- `.p`
- `.pwn`
- `.inc`

## Current features

- Tree-sitter Pawn grammar
- Syntax highlighting for Pawn keywords, tags, functions, variables,
  preprocessor directives, literals, operators, and comments
- Local scopes and symbol tags for functions, variables, enums, and macros
- 13 converted Pawn snippets
- 1,938 converted completion entries exposed as Zed snippets

The grammar is loaded from the `grammar/` subdirectory of the
`Fanorisky/zed-pawn-kit` repository. The manifest currently tracks the `main`
branch; for a release, pin `rev` to an immutable commit SHA.

## Source

The grammar is a Tree-sitter adaptation of
`/home/fanorisky/PocketPawn/kit/Pawn.tmLanguage`. The Sublime Text snippets and
completion entries from the kit have been converted to Zed JSON snippets in
`snippets/pawn.json` and `snippets/pawn-completions.json`.

## Developing the grammar

```sh
npm --prefix grammar install
npm --prefix grammar run generate
npm --prefix grammar run test
node scripts/convert-pocketpawn-completions.mjs \
  /home/fanorisky/PocketPawn/kit/completions \
  snippets/pawn-completions.json
```

The extension currently does not include a language server because the
PocketPawn kit provides editor grammar and completion data, but no Pawn LSP.
