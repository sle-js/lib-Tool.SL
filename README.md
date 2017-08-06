This project describes a simple general purpose language to test out some of my ideas around structural types and seeing
how that would work.  The unification algorithm in itself needs to be worked out.
  

## Features

The features that I would like to be included in this language are:

- Native data types: Char, Int, String, Float, Unit and functions
- Type constraints through type signatures
- Object based where an object is a collection of named values
- No side-effects
- No null values and no exceptions
- No inheritance but object composition using delegation
- No modules for now


## Grammar

The following describes the grammar of the language.

```text
start ::= 
      declaration+

declaration ::= 
      type_declaration 
    | data_declaration 
    | name_signature_declaration 
    | name_declaration

type_declaration ::= 
      TYPE UPPER_ID LOWER_ID* EQUAL type
 
type ::= 
      type_constraints? type_references

type_references ::= 
      type_reference ( AMPERSAND type_reference )*

type_reference ::= 
      type_reference_1 ( MINUSGREATER type_reference_1 )*
    
type_reference_1 ::= 
      type_reference_2 ( STAR type_reference_2 )*
    
type_reference_2 ::= 
      UPPER_ID type_reference*
    | LCURLY ( name_signature_declaration | name_declaration ) ( COMMA ( name_signature_declaration | name_declaration ) )* RCURLY
    | INT
    | STRING
    | BOOL
    | CHAR
    | LPAREN RPAREN
    | LPAREN type_reference RPAREN

type_constraints ::= 
      type_constraint ( COMMA type_constraint )*

type_constraint ::= 
      LOWER_ID COLONCOLON type_references

data_declaration ::= 
      DATA UPPER_ID LOWER_ID* EQUAL type_constraints? EQUALGREATER type_references 
      UPPER_ID type_references ( BAR UPPER_ID type_references )*
      declaration*

name_signature_decalaration ::= 
      LOWER_ID COLONCOLON type

name_declaration ::= 
      LOWER_ID LOWER_ID* EQUAL expression
      
expression ::= 
      ...
```

### Precedence

The following table lists the operators and their associated precedence.

| Operators | Description |
|-----------|-------------|
| <\| \|> | Backwards and forwards pipe |
| o | Function composition |
| && | Boolean and |
| \|\| | Boolean or |
| obj.n | Reference a object's field |
| f x | Function application |


## Example

The following is an example of a piece of code showing off the usage of types and data.

```haskell
data List a b = a :: Parity & Show => Parity & Show &
          Nil
        | Cons a (List a) {
  $EQEQ :: Parity a => Self -> Bool
  $EQEQ other =
    match (self, other)
    | (Nil, Nil) => true
    | (Cons s ss, Cons o os) => s.$EQEQ(o) && ss.$EQEQ(os)
    | else => false

  show :: Show a => () -> String
  show () =
    match self
    | Nil => ""
    | Cons x Nil => x.show()
    | Cons x xs => x.show() ++ ", " ++ xs.show()
}
```

