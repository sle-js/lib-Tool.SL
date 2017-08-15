// data Module = Module { imports :: Array Import, declarations :: Array Declaration }
function ModuleType(imports, declarations) {
    this.imports = imports;
    this.declarations = declarations;
}


// Module :: { imports :: Array Import, declarations :: Array Declaration } -> Module
const Module = imports => declarations =>
    new ModuleType(imports, declarations);


// data Import =
//          UnqualifiedImport { urn :: String }
//        | QualifiedImport { urn :: String, name :: String }
//        | QualifiedNameImport { urn :: String, names :: Sequence { name ::  String, qualified :: Maybe String }}
function ImportType(content) {
    this.content = content;
}


// UnqualifiedImport :: { urn :: String } -> Import
const UnqualifiedImport = unqualifiedImport =>
    new ImportType([0, unqualifiedImport]);


// QualifiedImport :: { urn :: String, name :: String } -> Import
const QualifiedImport = qualifiedImport =>
    new ImportType([1, qualifiedImport]);


// QualifiedNameImport :: { urn :: String, names :: Sequence { name ::  String, qualified :: Maybe String }} -> Import
const QualifiedNameImport = qualifiedNameImport =>
    new ImportType([2, qualifiedNameImport]);


// data Declaration =
//        TypeDeclaration { name :: String, parameters :: List String, type :: Type }
//      | NameSignatureDeclaration { name :: String, type :: Type }
function DeclarationType(content) {
    this.content = content;
}


const TypeDeclaration = name => parameters => type =>
    new DeclarationType([0, {name, parameters, type}]);


const NameSignatureDeclaration = name => type =>
    new DeclarationType([1, {name, type}]);


// data TypeReferences =
//        ReferencedType TypeReference             -- 0
//      | ComposedType Array(TypeReference)        -- 1

function TypeReferencesType(content) {
    this.content = content;
}


const ReferencedType = typeReferences =>
    new TypeReferencesType([0, typeReferences]);


const ComposedType = typeReferences =>
    new TypeReferencesType([1, typeReferences]);


// data TypeReference =
//        Int                                      -- 0
//      | String                                   -- 1
//      | Bool                                     -- 2
//      | Char                                     -- 3
//      | Self                                     -- 4
//      | Unit                                     -- 5
//      | DataReference String Array(Type)         -- 6
//      | Reference String                         -- 7
//      | Union Array(TypeReference)               -- 8
//      | Function TypeReference TypeReference     -- 9
//      | NTuple Array(TypeReference)              -- 10
//      | ComposedType Array(TypeReference)        -- 11


function TypeReferenceType(content) {
    this.content = content;
}


const Int =
    new TypeReferenceType([0]);


const String =
    new TypeReferenceType([1]);


const Bool =
    new TypeReferenceType([2]);


const Char =
    new TypeReferenceType([3]);


const Self =
    new TypeReferenceType([4]);


const Unit =
    new TypeReferenceType([5]);


const DataReference = name => parameters =>
    new TypeReferenceType([6, name, parameters]);


const Reference = name =>
    new TypeReferenceType([7, name]);


const Function = domain => range =>
    new TypeReferenceType([9, domain, range]);


const NTuple = typeReferences =>
    new TypeReferenceType([10, typeReferences]);


// type TypeConstraint = { name :: String, typeReferences :: List TypeReferences }

const TypeConstraint = name => typeReferences => ({name, typeReferences});


// type Type = { constraints :: List TypeConstraint, typeReferences :: TypeReferences }

const Type = constraints => typeReferences => ({constraints, typeReferences});


module.exports = {
    Module,
    UnqualifiedImport,
    QualifiedImport,
    QualifiedNameImport,

    TypeDeclaration,
    NameSignatureDeclaration,

    ComposedType,
    ReferencedType,

    Bool,
    Char,
    DataReference,
    Function,
    Int,
    NTuple,
    Reference,
    Self,
    String,
    Unit,

    TypeConstraint,

    Type
};