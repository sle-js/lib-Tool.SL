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


module.exports = {
    Module,
    UnqualifiedImport,
    QualifiedImport,
    QualifiedNameImport,
};