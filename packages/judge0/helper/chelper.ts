import { UnsupportedTypeError } from "./shared";

/**
 * C helper functions. C uses LeetCode's size-parameter convention, so a simple
 * read/dump codec (like the other languages) isn't enough: array params expand
 * into `T* name, int nameSize`, and array returns add a trailing `int*
 * returnSize`. These descriptors carry that extra shape. The matching C
 * functions live in c/template.ts (C_HARNESS).
 */

export interface CParamDesc {
  /** Fragment in the function parameter list, e.g. "int* nums, int numsSize". */
  paramDecl: string;
  /** Fragment in the call, e.g. "nums, numsSize". */
  callArg: string;
  /** C statement(s) declaring the var(s) from a stdin line. */
  readStmt: (line: string) => string;
}

export interface CReturnDesc {
  /** C return type, e.g. "int" or "int*". */
  retType: string;
  /** Appended to the param list for array returns, e.g. ", int* returnSize". */
  extraParamDecl: string;
  /** Appended to the call args for array returns, e.g. ", &returnSize". */
  extraCallArg: string;
  /** Statements that run the call and print the result. */
  emit: (call: string) => string;
}

export function cParamDesc(type: string, name: string): CParamDesc {
  const t = type.trim().replace(/\s+/g, "");
  switch (t) {
    case "int":
      return { paramDecl: `int ${name}`, callArg: name, readStmt: (l) => `int ${name} = parse_int(${l});` };
    case "long":
      return { paramDecl: `long ${name}`, callArg: name, readStmt: (l) => `long ${name} = parse_long(${l});` };
    case "double":
      return { paramDecl: `double ${name}`, callArg: name, readStmt: (l) => `double ${name} = parse_double(${l});` };
    case "bool":
      return { paramDecl: `bool ${name}`, callArg: name, readStmt: (l) => `bool ${name} = parse_bool(${l});` };
    case "char":
      return { paramDecl: `char ${name}`, callArg: name, readStmt: (l) => `char ${name} = parse_char(${l});` };
    case "char*":
      return { paramDecl: `char* ${name}`, callArg: name, readStmt: (l) => `char* ${name} = parse_string(${l});` };
    case "int*":
      return {
        paramDecl: `int* ${name}, int ${name}Size`,
        callArg: `${name}, ${name}Size`,
        readStmt: (l) => `int ${name}Size; int* ${name} = parse_int_array(${l}, &${name}Size);`,
      };
    case "TreeNode*":
      return { paramDecl: `struct TreeNode* ${name}`, callArg: name, readStmt: (l) => `struct TreeNode* ${name} = parse_tree(${l});` };
    case "ListNode*":
      return { paramDecl: `struct ListNode* ${name}`, callArg: name, readStmt: (l) => `struct ListNode* ${name} = parse_list(${l});` };
    default:
      throw new UnsupportedTypeError(type);
  }
}

export function cReturnDesc(type: string): CReturnDesc {
  const t = type.trim().replace(/\s+/g, "");
  const scalar = (retType: string, printer: string): CReturnDesc => ({
    retType,
    extraParamDecl: "",
    extraCallArg: "",
    emit: (call) => `${retType} result = ${call};\n    ${printer}(result);`,
  });
  switch (t) {
    case "int":
      return scalar("int", "print_int");
    case "long":
      return scalar("long", "print_long");
    case "double":
      return scalar("double", "print_double");
    case "bool":
      return scalar("bool", "print_bool");
    case "char":
      return scalar("char", "print_char");
    case "char*":
      return scalar("char*", "print_string");
    case "TreeNode*":
      return scalar("struct TreeNode*", "print_tree");
    case "ListNode*":
      return scalar("struct ListNode*", "print_list");
    case "int*":
      return {
        retType: "int*",
        extraParamDecl: ", int* returnSize",
        extraCallArg: ", &returnSize",
        emit: (call) =>
          `int returnSize;\n    int* result = ${call};\n    print_int_array(result, returnSize);`,
      };
    default:
      throw new UnsupportedTypeError(type);
  }
}
