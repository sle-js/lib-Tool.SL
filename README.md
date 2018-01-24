This project describes a simple general purpose language to test out some of my ideas around structural types and seeing
how that would work.  The unification algorithm in itself needs to be worked out.
  

## Features

The features that I would like to be included in this language are:

- Native data types: Char, Int, String, Float, Unit and functions
- Object based where an object is a collection of named values
- No side-effects
- No null values and no exceptions
- No inheritance but object composition using delegation
- No external configuration files but rather all dependencies are placed within the source files
- No runtime errors

I am not sure how far I can push the "no runtime errors" but I would like to push it as far as I can.


## Approach

The approach to be taken in building a compiler for this language is:

- Incrementally add features piece by piece
- Included type checking from the start
- Build the compiler in JavaScript until, at some point, the compiled language is sufficiently feature rich that it can 
  be bootstrapped.


## Grammar

The following describes the grammar of the language that is under development for the next feature.

```text
Module = 
    {Declaration};
      
Declaration =
    lowerID '=' Expression;

Expression =
    IfExpression;
    
IfExpression =
    IF LambdaExpression THEN LambdaExpression ELSE LambdaExpression
  | LambdaExpression;
  
LambdaExpression =
    lowerID {lowerID} '->' Expression
  | BooleanOrExpression;
  
BooleanOrExpression =
    BooleanAndExpression {'||' BooleanAndExpression}; 
    
BooleanAndExpression =
    RelationalOpExpression {'&&' RelationalOpExpression}; 
    
RelationalOpExpression =
    AdditiveExpression {['==' | '!=' | '<' | '<=' | '>' | '>='] AdditiveExpression}; 

AdditiveExpression =
    MultiplicativeExpression {['+' | '-'] MultiplicativeExpression};

MultiplicativeExpression =
    FunctionalApplicationExpression {['*' | '/'] FunctionalApplicationExpression};
    
FunctionalApplicationExpression =
    TerminalExpression {TerminalExpression};
    
TerminalExpression =
    '(' Expression ')'
  | CONSTANTINT
  | CONSTANTBOOL
  | CONSTANTSTRING
  | '!' Expression
  | lowerID;
```

Commentary:

* The grammar is ambiguous with the ambiguity resolved through indentation.


### Precedence

The following table lists the operators and their associated precedence.  Although these operators have not been 
included into the grammar this serves as a working list.

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
| ! | Constants and reference |


## Example

The following are pieces of code that I fiddle around with to arrange my thoughts.

```haskell
map: (f: a -> b) -> (v: a?) -> (b?) =
    match v 
    | v: a -> f a
    | Null -> Null
        

age: ({ year: Int } | Null) -> (Int | Null) =
    map (\d -> 2018 - d.year) 


type Date = {
    millisecondsSince1970: Int,   
    year: Int = millisecondsSince1970 / 31540000000
}


type List <T: Parity | Show> =
        Nil 
      | Cons T (List T) {
    length: Int =
        match self 
        | Nil -> 0
        | Cons x xs -> 1 + xs.length
            
    map <S: Parity | Show>: (f: T -> S) -> (List S) =
        match self
        | Nil -> Nil
        | Cons x xs -> Cons (f x) (xs.map f)
          
    show: String =
        match self
        | Nil -> "[]"
        | Cons x xs -> "[" ++ xs.foldl x.show (\a \i -> i.show ++ ", " ++ a) ++ "]"
                    
    (==): (o: T) -> Bool =
        match (self, o)
        | (Nil, Nil) -> true
        | (Cons x xs, Cons y ys) -> x == y && xs == ys
        | _ -> false     
} | Parity | Show


type NewList <T: Parity | Show> = List a {
    reduce <S>: S -> (S -> T -> S) -> S = 
        foldl
}


type Show = {
    show: () -> String
}

type CINT = {
    x: NativeInt,
    show: () = x.show
} | Show

type PLUS <E: Show> = {
    r: E,
    l: E,
    show: () = ...
} | Show

type EQUALS <E: Show> = {
    r: E,
    l: E,
    show: () = ...
} | Show

type Expression = 
    CINT | PLUS <Expression> | EQUALS <Expression>


type CSTRING = {
    x: NativeString,
    show: () = x.show
} | Show


type NExpression =
    CINT | PLUS <NExpression> | EQUALS <NExpression> | CSTRING
    

type Nil = {
  length: () -> 0
}

type Cons <T, S: { length: () -> Int }> = {
    car: T,
    cdr: S,
    length: () -> 1 + cdr.length()
}

type List <T> =
    Nil | Cons <T, List <T>> 
```

