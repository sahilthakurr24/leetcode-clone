/**
 * Reusable C++ harness injected into every submission (before the user's
 * `Solution` class). Because C++ has no built-in JSON, this provides:
 *  - the canonical LeetCode `TreeNode` / `ListNode` structs,
 *  - a tiny JSON-value parser (`parseJson`) tolerant of nesting / nulls / strings,
 *  - typed converters (`toInt`, `toVecInt`, `buildTree`, `buildList`, ...),
 *  - canonical compact-JSON writers (`dump`, `dumpTree`, `dumpList`),
 *  - `readAllLines()` to read one JSON argument per stdin line.
 *
 * The generated `main()` (see ./generator.ts) calls these by name, chosen from the
 * problem's parameter/return types. Output format is compact JSON and MUST match
 * the host-side `serializeExpected` so Judge0's expected_output comparison holds.
 *
 * Written with String.raw so backslashes in the C++ source are preserved
 * verbatim. The C++ below must never contain a backtick or the sequence `${`.
 */
export const CPP_HARNESS = String.raw`
// ----- LeetCode node types -----
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {}
};

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *n) : val(x), next(n) {}
};

// ----- minimal JSON value + parser -----
struct JsonValue {
    enum Kind { Null, Bool, Number, String, Array } kind = Null;
    bool boolVal = false;
    std::string raw;                 // number text (Number) or decoded text (String)
    std::vector<JsonValue> arr;      // Array
    bool isNull() const { return kind == Null; }
};

struct JsonParser {
    const std::string &s;
    size_t i = 0;
    JsonParser(const std::string &str) : s(str) {}
    void ws() { while (i < s.size() && std::isspace((unsigned char)s[i])) i++; }
    JsonValue value() {
        ws();
        if (i >= s.size()) return JsonValue{};
        char c = s[i];
        if (c == '[') return array();
        if (c == '"') return str();
        if (c == 't' || c == 'f') return boolean();
        if (c == 'n') { i += 4; return JsonValue{}; }
        return number();
    }
    JsonValue array() {
        JsonValue v; v.kind = JsonValue::Array;
        i++; ws();
        if (i < s.size() && s[i] == ']') { i++; return v; }
        while (i < s.size()) {
            v.arr.push_back(value());
            ws();
            if (i < s.size() && s[i] == ',') { i++; continue; }
            if (i < s.size() && s[i] == ']') { i++; break; }
            break;
        }
        return v;
    }
    JsonValue str() {
        JsonValue v; v.kind = JsonValue::String;
        i++;
        std::string out;
        while (i < s.size() && s[i] != '"') {
            char c = s[i++];
            if (c == '\\' && i < s.size()) {
                char e = s[i++];
                switch (e) {
                    case 'n': out.push_back('\n'); break;
                    case 't': out.push_back('\t'); break;
                    case 'r': out.push_back('\r'); break;
                    case 'b': out.push_back('\b'); break;
                    case 'f': out.push_back('\f'); break;
                    default: out.push_back(e); break; // covers " \\ /
                }
            } else {
                out.push_back(c);
            }
        }
        if (i < s.size()) i++; // closing quote
        v.raw = out;
        return v;
    }
    JsonValue boolean() {
        JsonValue v; v.kind = JsonValue::Bool;
        if (s[i] == 't') { v.boolVal = true; i += 4; } else { v.boolVal = false; i += 5; }
        return v;
    }
    JsonValue number() {
        JsonValue v; v.kind = JsonValue::Number;
        size_t start = i;
        while (i < s.size()) {
            char c = s[i];
            if (std::isdigit((unsigned char)c) || c == '-' || c == '+' ||
                c == '.' || c == 'e' || c == 'E') i++;
            else break;
        }
        v.raw = s.substr(start, i - start);
        return v;
    }
};

JsonValue parseJson(const std::string &line) {
    JsonParser p(line);
    return p.value();
}

// ----- typed converters (JsonValue -> C++) -----
int toInt(const JsonValue &v) { return (int)std::stoll(v.raw); }
long long toLong(const JsonValue &v) { return std::stoll(v.raw); }
double toDouble(const JsonValue &v) { return std::stod(v.raw); }
bool toBool(const JsonValue &v) {
    if (v.kind == JsonValue::Bool) return v.boolVal;
    return v.raw == "true" || v.raw == "1";
}
std::string toStr(const JsonValue &v) { return v.raw; }
char toChar(const JsonValue &v) { return v.raw.empty() ? '\0' : v.raw[0]; }

std::vector<int> toVecInt(const JsonValue &v) {
    std::vector<int> o; for (auto &e : v.arr) o.push_back(toInt(e)); return o;
}
std::vector<long long> toVecLong(const JsonValue &v) {
    std::vector<long long> o; for (auto &e : v.arr) o.push_back(toLong(e)); return o;
}
std::vector<double> toVecDouble(const JsonValue &v) {
    std::vector<double> o; for (auto &e : v.arr) o.push_back(toDouble(e)); return o;
}
std::vector<bool> toVecBool(const JsonValue &v) {
    std::vector<bool> o; for (auto &e : v.arr) o.push_back(toBool(e)); return o;
}
std::vector<std::string> toVecStr(const JsonValue &v) {
    std::vector<std::string> o; for (auto &e : v.arr) o.push_back(toStr(e)); return o;
}
std::vector<char> toVecChar(const JsonValue &v) {
    std::vector<char> o; for (auto &e : v.arr) o.push_back(toChar(e)); return o;
}
std::vector<std::vector<int>> toVecVecInt(const JsonValue &v) {
    std::vector<std::vector<int>> o; for (auto &e : v.arr) o.push_back(toVecInt(e)); return o;
}
std::vector<std::vector<std::string>> toVecVecStr(const JsonValue &v) {
    std::vector<std::vector<std::string>> o; for (auto &e : v.arr) o.push_back(toVecStr(e)); return o;
}
std::vector<std::vector<char>> toVecVecChar(const JsonValue &v) {
    std::vector<std::vector<char>> o; for (auto &e : v.arr) o.push_back(toVecChar(e)); return o;
}

ListNode* buildList(const JsonValue &v) {
    ListNode dummy; ListNode *cur = &dummy;
    for (auto &e : v.arr) { cur->next = new ListNode(toInt(e)); cur = cur->next; }
    return dummy.next;
}

TreeNode* buildTree(const JsonValue &v) {
    if (v.kind != JsonValue::Array || v.arr.empty() || v.arr[0].isNull()) return nullptr;
    TreeNode *root = new TreeNode(toInt(v.arr[0]));
    std::queue<TreeNode*> q; q.push(root);
    size_t idx = 1;
    while (!q.empty() && idx < v.arr.size()) {
        TreeNode *node = q.front(); q.pop();
        if (idx < v.arr.size()) {
            const JsonValue &lv = v.arr[idx++];
            if (!lv.isNull()) { node->left = new TreeNode(toInt(lv)); q.push(node->left); }
        }
        if (idx < v.arr.size()) {
            const JsonValue &rv = v.arr[idx++];
            if (!rv.isNull()) { node->right = new TreeNode(toInt(rv)); q.push(node->right); }
        }
    }
    return root;
}

// ----- canonical compact-JSON writers -----
std::string dump(int x) { return std::to_string(x); }
std::string dump(long long x) { return std::to_string(x); }
std::string dump(bool x) { return x ? "true" : "false"; }
std::string dump(double x) {
    if (std::abs(x - (long long)x) < 1e-9 && std::abs(x) < 1e15)
        return std::to_string((long long)x);
    std::ostringstream oss;
    oss << std::setprecision(15) << x;
    return oss.str();
}
std::string dump(const std::string &s) {
    std::string out = "\"";
    for (char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\t': out += "\\t"; break;
            case '\r': out += "\\r"; break;
            default: out.push_back(c);
        }
    }
    out += "\"";
    return out;
}
std::string dump(char c) { return dump(std::string(1, c)); }

template <typename T>
std::string dump(const std::vector<T> &v) {
    std::string out = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) out += ","; out += dump(v[i]); }
    out += "]";
    return out;
}

std::string dumpList(ListNode *head) {
    std::string out = "[";
    bool first = true;
    for (ListNode *c = head; c; c = c->next) {
        if (!first) out += ",";
        out += std::to_string(c->val);
        first = false;
    }
    out += "]";
    return out;
}

std::string dumpTree(TreeNode *root) {
    if (!root) return "[]";
    std::vector<std::string> out;
    std::queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        TreeNode *node = q.front(); q.pop();
        if (node) {
            out.push_back(std::to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            out.push_back("null");
        }
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    std::string res = "[";
    for (size_t i = 0; i < out.size(); i++) { if (i) res += ","; res += out[i]; }
    res += "]";
    return res;
}

// ----- stdin (one JSON argument per line) -----
std::vector<std::string> readAllLines() {
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(std::cin, line)) lines.push_back(line);
    return lines;
}
`;
