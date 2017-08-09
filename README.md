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


## Approach

The approach to be taken in building a compiler for this language is:

- Parser for the entire language
- First phase is to ignore all of the type information and perform a translation
- Second phase is to introduce type verification

The rationale is that compiling with this syntax is still an improvement over writing native JavaScript.  The type 
information offers itself as documentation whilst benefit can be derived from the syntax.


## Grammar

The following describes the grammar of the language.

```text
Module = 
      Declaration {Declaration};

Declaration = 
      TypeDeclaration 
    | DataDeclaration 
    | NameSignatureDeclaration 
    | NameDeclaration;

TypeDeclaration = 
      TYPE upperID {lowerID} "=" Type;
 
Type = 
      [TypeConstraints] TypeReferences;

TypeReferences = 
      TypeReference {"&" TypeReference};

TypeReference = 
      TypeReference1 {"->" TypeReference1};
    
TypeReference1 = 
      TypeReference2 {"*" TypeReference2};
    
TypeReference2 = 
      upperID {TypeReference}
    | "{" (NameSignatureDeclaration | NameDeclaration) {"," (NameSignatureDeclaration | NameDeclaration)} "}"
    | INT
    | STRING
    | BOOL
    | CHAR
    | "()"
    | "(" TypeReference ")";

TypeConstraints = 
      TypeConstraint {"," TypeConstraint};

TypeConstraint = 
      lowerID "::" TypeReferences;

DataDeclaration = 
      DATA upperID {lowerID} "=" [TypeConstraints] "=>" TypeReferences 
      upperID TypeReferences {"|" upperID type_references}
      {Declaration};

NameSignatureDeclaration = 
      lowerID "::" Type;

NameDeclaration = 
      lowerID {lowerID} "=" Expression;
      
Expression = 
      ...
```

### Precedence

The following table lists the operators and their associated precedence.

| Operators | Description |
|-----------|-------------|
| if        | if-then-else |
| let       | Local declarations |
| where     | Local declarations within the let expression |
| case      | Case expression |
| <\| \|> | Backwards and forwards pipe |
| o | Function composition |
| -> | Lambda functions |
| \|\| | Boolean or |
| && | Boolean and |
| + - | Additive operators |
| * / | Multiplicative operators |
| f x | Function application |
| obj.n | Reference an object's field |
| & | Composition |
| - | Constants and reference |


## Example

The following is an example of a piece of code showing off the usage of types and data.

```haskell
data List a b = a :: Parity & Show => Parity & Show &
          Nil
        | Cons a (List a) {
  $EQEQ :: Parity a => Self -> Bool
  $EQEQ other =
    case (self, other) of
      (Nil, Nil) -> true
      (Cons s ss, Cons o os) -> s == o && ss == os
      else -> false

  show :: Show a => () -> String
  show () =
    case self of
      Nil -> ""
      Cons x Nil -> x.show()
      Cons x xs -> x.show() ++ ", " ++ xs.show()
}
```
