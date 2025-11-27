; Forge YAML Syntax Highlighting for Zed
; Uses tree-sitter-yaml grammar
; https://github.com/royalbit/forge

; Comments
(comment) @comment

; Keys
(block_mapping_pair
  key: (flow_node) @property)

; Strings
(single_quote_scalar) @string
(double_quote_scalar) @string

; Numbers
(integer_scalar) @number
(float_scalar) @number

; Booleans
(boolean_scalar) @constant.builtin

; Null
(null_scalar) @constant.builtin

; Forge formulas (strings starting with =)
((double_quote_scalar) @string.special
  (#match? @string.special "^\"=.*\"$"))

; Excel functions in formulas (60+ supported)
; Aggregation: SUM, AVERAGE, COUNT, MAX, MIN, PRODUCT
; Conditional: SUMIF, COUNTIF, AVERAGEIF, SUMIFS, COUNTIFS, AVERAGEIFS, MAXIFS, MINIFS
; Logical: IF, AND, OR, NOT, IFERROR
; Math: ROUND, ROUNDUP, ROUNDDOWN, CEILING, FLOOR, SQRT, POWER, MOD, ABS
; Text: CONCAT, UPPER, LOWER, TRIM, LEN, MID, LEFT, RIGHT
; Date: TODAY, DATE, YEAR, MONTH, DAY, EDATE, EOMONTH, DATEDIF
; Lookup: MATCH, INDEX, XLOOKUP, VLOOKUP, CHOOSE
; Financial: NPV, IRR, XNPV, XIRR, PMT, PV, FV, RATE, NPER
((double_quote_scalar) @function.builtin
  (#match? @function.builtin "(SUM|AVERAGE|COUNT|MAX|MIN|PRODUCT|SUMIF|COUNTIF|AVERAGEIF|SUMIFS|COUNTIFS|AVERAGEIFS|MAXIFS|MINIFS|IF|AND|OR|NOT|IFERROR|ROUND|ROUNDUP|ROUNDDOWN|CEILING|FLOOR|SQRT|POWER|MOD|ABS|CONCAT|UPPER|LOWER|TRIM|LEN|MID|LEFT|RIGHT|TODAY|DATE|YEAR|MONTH|DAY|EDATE|EOMONTH|DATEDIF|MATCH|INDEX|XLOOKUP|VLOOKUP|CHOOSE|NPV|IRR|XNPV|XIRR|PMT|PV|FV|RATE|NPER)"))