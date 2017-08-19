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
      {Import}
      Declaration {Declaration};

Import = 
      USE importReference [AS upperID | [IMPORT (Id [AS Id] | "(" Id [AS Id] {"," Id [AS Id]} ")")]];
      
Id =
      upperID
    | lowerID;
    
Declaration = 
      TypeDeclaration 
    | DataDeclaration 
    | NameSignatureDeclaration 
    | NameDeclaration;

TypeDeclaration = 
      TYPE upperID {lowerID} "=" Type;
 
Type = 
      [TypeConstraints "=>"] TypeReferences;

TypeReferences = 
      TypeReference {"&" TypeReference};

TypeReference = 
      TypeReference1 {"->" TypeReference1};
    
TypeReference1 = 
      TypeReference2 {"*" TypeReference2};
    
TypeReference2 =
      upperID TypeReference3 {TypeReference3}
    | TypeReference3;
    
TypeReference3 = 
      upperID
    | lowerID
    | "{" (NameSignatureDeclaration | NameDeclaration) {"," (NameSignatureDeclaration | NameDeclaration)} "}"
    | INT
    | STRING
    | BOOL
    | CHAR
    | SELF
    | "()"
    | "(" TypeReference ")";

TypeConstraints = 
      TypeConstraint {"," TypeConstraint};

TypeConstraint = 
      (lowerID | "Self") "::" TypeReferences;

DataDeclaration = 
      DATA upperID {lowerID} "=" [TypeConstraints "=>"] 
      upperID {TypeReference} {"|" upperID {TypeReference}}
      {Declaration};

NameSignatureDeclaration = 
      Name "::" Type;

NameDeclaration = 
      Name {lowerID | "()"} "=" IfExpression;

Name =
      lowerID
    | "(" OperatorName ")";
    
OperatorName =
      "+" | "-" | "*" | "/" | "==" | "!=" | "<" | "<=" | ">" | ">=" | "||" | "&&";
      
Expression = 
      IF LetExpression THEN LetExpression ELSE LetExpression
    | LetExpression;
    
LetExpression =
      LET Declaration {Declaration} IN WhereExpression
    | WhereExpression;
    
WhereExpression =
      CaseExpression [WHERE Declaration {Declaration}];
      
CaseExpression =
      CASE PipeExpression OF Case {Case} [ELSE 
    | PipeExpression;
    
PipeExpression =
      CompositionExpression {("<|" | "|>") CompositionExpression};
      
CompositionExpression =
      LambdaExpression {"o" LambdaExpression};
      
LambdaExpression =
      "\" (lowerID | "()") {lowerID | "()"} "->" ObjectCompositionExpression
    | ObjectCompositionExpression;

ObjectCompositionExpression =
      OrExpression {"&" OrExpression};
    
OrExpression =
      AndExpression {"||" AndExpression};
      
AndExpression = 
      RelationalExpression {"&&" RelationalExpression};
      
RelationalExpression =
      AdditiveExpression {("==" | "!=" | "<" | ">" | "<=" | "=>") AdditiveExpression};
      
AdditiveExpression =
      MultiplicativeExpression {("+" | "-") MultiplicativeExpression};
       
MultiplicativeExpression =
      ApplicationExpression {("*" | "/") ApplicationExpression}''

ApplicationExpression =
      ReferenceExpression {ReferenceExpression};
      
ReferenceExpression =
      SimpleExpression "." Id;
      
SimpleExpression =
      SELF
    | Id
    | TRUE
    | FALSE
    | constantString
    | constantChar
    | constantInteger
    | constantFloat
    | "()"
    | "(" Expression {"," Expression} )";
    | "(" OperatorName ")"
    | "{" [Expression "|"] (NameSignatureDeclaration | NameDeclaration) {"," (NameSignatureDeclaration | NameDeclaration)} "}"
    
Case =
      Pattern "->" Expression;
      
Pattern =
      TRUE
    | FALSE
    | constantString
    | constantChar
    | constantInteger
    | constantFloat
    | "_"
    | lowerID
    | "()"
    | "(" Pattern {"," Pattern} )"
    | upperID {Pattern};
```

Commentary:

* The grammar is ambiguous with the ambiguity resolved through indentation.


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
| & | Composition |
| \|\| | Boolean or |
| && | Boolean and |
| == != < <= > >= | Relational operators |
| + - | Additive operators |
| * / | Multiplicative operators |
| f x | Function application |
| obj.n | Reference an object's field |
| - | Constants and reference |


## Example

The following is an example of a piece of code showing off the usage of types and data.

```haskell
use core:Parity:1.0.0
use core:Show:1.0.0

data List a b = a :: Parity & Show, Self :: Parity & Show => 
          Nil
        | Cons a (List a) 
  (==) :: Parity a => Self -> Bool
  (==) other =
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
```
