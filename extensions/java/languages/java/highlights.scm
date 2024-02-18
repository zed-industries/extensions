;; highlights.scm
(define java-syntax
  '(("keywords" ("abstract" "assert" "boolean" ... "while"))
    ("comments" ("//.*" "/\\*.*?\\*/"))
    ("strings" ("\".*?\""))
    ("annotations" ("@\\w+"))))
