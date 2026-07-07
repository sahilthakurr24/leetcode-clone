/**
 * Reusable Rust harness. Judge0's Rust has no serde, so this hand-rolls a tiny
 * JSON parser, typed converters, and canonical compact-JSON dumps. Output
 * matches the host-side `serializeExpected`.
 *
 * Supports scalars (i32/i64/f64/bool/String), 1D/2D vectors, trees
 * (Option<Rc<RefCell<TreeNode>>>) and lists (Option<Box<ListNode>>).
 */
export const RUST_HARNESS = String.raw`
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
    pub val: i32,
    pub left: Option<Rc<RefCell<TreeNode>>>,
    pub right: Option<Rc<RefCell<TreeNode>>>,
}
impl TreeNode {
    #[inline]
    pub fn new(val: i32) -> Self {
        TreeNode { val, left: None, right: None }
    }
}

#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>,
}
impl ListNode {
    #[inline]
    pub fn new(val: i32) -> Self {
        ListNode { next: None, val }
    }
}

enum JsonValue {
    Null,
    Bool(bool),
    Num(String),
    Str(String),
    Arr(Vec<JsonValue>),
}

impl JsonValue {
    // Judge0 runs Rust 1.40, which predates the matches! macro (1.42).
    fn is_null(&self) -> bool {
        match self {
            JsonValue::Null => true,
            _ => false,
        }
    }
}

struct Parser {
    chars: Vec<char>,
    i: usize,
}

impl Parser {
    fn new(s: &str) -> Self {
        Parser { chars: s.chars().collect(), i: 0 }
    }
    fn ws(&mut self) {
        while self.i < self.chars.len() && self.chars[self.i].is_whitespace() {
            self.i += 1;
        }
    }
    fn value(&mut self) -> JsonValue {
        self.ws();
        if self.i >= self.chars.len() {
            return JsonValue::Null;
        }
        match self.chars[self.i] {
            '[' => self.arr(),
            '"' => self.string(),
            't' | 'f' => self.boolean(),
            'n' => { self.i += 4; JsonValue::Null }
            _ => self.number(),
        }
    }
    fn arr(&mut self) -> JsonValue {
        self.i += 1;
        self.ws();
        let mut v = Vec::new();
        if self.i < self.chars.len() && self.chars[self.i] == ']' {
            self.i += 1;
            return JsonValue::Arr(v);
        }
        loop {
            v.push(self.value());
            self.ws();
            if self.i < self.chars.len() && self.chars[self.i] == ',' { self.i += 1; continue; }
            if self.i < self.chars.len() && self.chars[self.i] == ']' { self.i += 1; break; }
            break;
        }
        JsonValue::Arr(v)
    }
    fn string(&mut self) -> JsonValue {
        self.i += 1;
        let mut s = String::new();
        while self.i < self.chars.len() && self.chars[self.i] != '"' {
            let c = self.chars[self.i];
            self.i += 1;
            if c == '\\' && self.i < self.chars.len() {
                let e = self.chars[self.i];
                self.i += 1;
                match e {
                    'n' => s.push('\n'),
                    't' => s.push('\t'),
                    'r' => s.push('\r'),
                    _ => s.push(e),
                }
            } else {
                s.push(c);
            }
        }
        if self.i < self.chars.len() { self.i += 1; }
        JsonValue::Str(s)
    }
    fn boolean(&mut self) -> JsonValue {
        if self.chars[self.i] == 't' { self.i += 4; JsonValue::Bool(true) }
        else { self.i += 5; JsonValue::Bool(false) }
    }
    fn number(&mut self) -> JsonValue {
        let start = self.i;
        while self.i < self.chars.len() {
            let c = self.chars[self.i];
            if c.is_ascii_digit() || c == '-' || c == '+' || c == '.' || c == 'e' || c == 'E' {
                self.i += 1;
            } else {
                break;
            }
        }
        let s: String = self.chars[start..self.i].iter().collect();
        JsonValue::Num(s)
    }
}

fn parse_json(s: &str) -> JsonValue {
    Parser::new(s).value()
}

fn to_i32(v: &JsonValue) -> i32 { if let JsonValue::Num(s) = v { s.parse().unwrap() } else { 0 } }
fn to_i64(v: &JsonValue) -> i64 { if let JsonValue::Num(s) = v { s.parse().unwrap() } else { 0 } }
fn to_f64(v: &JsonValue) -> f64 { if let JsonValue::Num(s) = v { s.parse().unwrap() } else { 0.0 } }
fn to_bool(v: &JsonValue) -> bool { if let JsonValue::Bool(b) = v { *b } else { false } }
fn to_string(v: &JsonValue) -> String { if let JsonValue::Str(s) = v { s.clone() } else { String::new() } }
fn to_vec_i32(v: &JsonValue) -> Vec<i32> { if let JsonValue::Arr(a) = v { a.iter().map(to_i32).collect() } else { Vec::new() } }
fn to_vec_i64(v: &JsonValue) -> Vec<i64> { if let JsonValue::Arr(a) = v { a.iter().map(to_i64).collect() } else { Vec::new() } }
fn to_vec_f64(v: &JsonValue) -> Vec<f64> { if let JsonValue::Arr(a) = v { a.iter().map(to_f64).collect() } else { Vec::new() } }
fn to_vec_bool(v: &JsonValue) -> Vec<bool> { if let JsonValue::Arr(a) = v { a.iter().map(to_bool).collect() } else { Vec::new() } }
fn to_vec_string(v: &JsonValue) -> Vec<String> { if let JsonValue::Arr(a) = v { a.iter().map(to_string).collect() } else { Vec::new() } }
fn to_vec_vec_i32(v: &JsonValue) -> Vec<Vec<i32>> { if let JsonValue::Arr(a) = v { a.iter().map(to_vec_i32).collect() } else { Vec::new() } }
fn to_vec_vec_string(v: &JsonValue) -> Vec<Vec<String>> { if let JsonValue::Arr(a) = v { a.iter().map(to_vec_string).collect() } else { Vec::new() } }

fn dump_i32(x: &i32) -> String { x.to_string() }
fn dump_i64(x: &i64) -> String { x.to_string() }
fn dump_f64(x: &f64) -> String { if x.fract() == 0.0 { format!("{}", *x as i64) } else { format!("{}", x) } }
fn dump_bool(x: &bool) -> String { if *x { "true".to_string() } else { "false".to_string() } }
fn dump_string(x: &String) -> String {
    let mut o = String::from("\"");
    for c in x.chars() {
        match c {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            '\n' => o.push_str("\\n"),
            '\t' => o.push_str("\\t"),
            '\r' => o.push_str("\\r"),
            _ => o.push(c),
        }
    }
    o.push('"');
    o
}
fn dump_vec_i32(v: &Vec<i32>) -> String { let p: Vec<String> = v.iter().map(dump_i32).collect(); format!("[{}]", p.join(",")) }
fn dump_vec_i64(v: &Vec<i64>) -> String { let p: Vec<String> = v.iter().map(dump_i64).collect(); format!("[{}]", p.join(",")) }
fn dump_vec_f64(v: &Vec<f64>) -> String { let p: Vec<String> = v.iter().map(dump_f64).collect(); format!("[{}]", p.join(",")) }
fn dump_vec_bool(v: &Vec<bool>) -> String { let p: Vec<String> = v.iter().map(dump_bool).collect(); format!("[{}]", p.join(",")) }
fn dump_vec_string(v: &Vec<String>) -> String { let p: Vec<String> = v.iter().map(dump_string).collect(); format!("[{}]", p.join(",")) }
fn dump_vec_vec_i32(v: &Vec<Vec<i32>>) -> String { let p: Vec<String> = v.iter().map(dump_vec_i32).collect(); format!("[{}]", p.join(",")) }
fn dump_vec_vec_string(v: &Vec<Vec<String>>) -> String { let p: Vec<String> = v.iter().map(dump_vec_string).collect(); format!("[{}]", p.join(",")) }

type TreeLink = Option<Rc<RefCell<TreeNode>>>;
type ListLink = Option<Box<ListNode>>;

fn build_tree(v: &JsonValue) -> TreeLink {
    if let JsonValue::Arr(a) = v {
        if a.is_empty() || a[0].is_null() {
            return None;
        }
        let root = Rc::new(RefCell::new(TreeNode::new(to_i32(&a[0]))));
        let mut queue: VecDeque<Rc<RefCell<TreeNode>>> = VecDeque::new();
        queue.push_back(Rc::clone(&root));
        let mut idx = 1;
        while !queue.is_empty() && idx < a.len() {
            let node = queue.pop_front().unwrap();
            if idx < a.len() {
                if !a[idx].is_null() {
                    let child = Rc::new(RefCell::new(TreeNode::new(to_i32(&a[idx]))));
                    node.borrow_mut().left = Some(Rc::clone(&child));
                    queue.push_back(child);
                }
                idx += 1;
            }
            if idx < a.len() {
                if !a[idx].is_null() {
                    let child = Rc::new(RefCell::new(TreeNode::new(to_i32(&a[idx]))));
                    node.borrow_mut().right = Some(Rc::clone(&child));
                    queue.push_back(child);
                }
                idx += 1;
            }
        }
        Some(root)
    } else {
        None
    }
}

fn dump_tree(root: &TreeLink) -> String {
    let mut out: Vec<Option<i32>> = Vec::new();
    let mut queue: VecDeque<TreeLink> = VecDeque::new();
    queue.push_back(root.clone());
    while let Some(node) = queue.pop_front() {
        match node {
            Some(n) => {
                out.push(Some(n.borrow().val));
                queue.push_back(n.borrow().left.clone());
                queue.push_back(n.borrow().right.clone());
            }
            None => out.push(None),
        }
    }
    while let Some(last) = out.last() {
        if last.is_none() { out.pop(); } else { break; }
    }
    let parts: Vec<String> = out
        .iter()
        .map(|x| match x {
            Some(v) => v.to_string(),
            None => "null".to_string(),
        })
        .collect();
    format!("[{}]", parts.join(","))
}

fn build_list(v: &JsonValue) -> ListLink {
    let arr = to_vec_i32(v);
    let mut head: ListLink = None;
    for &x in arr.iter().rev() {
        head = Some(Box::new(ListNode { val: x, next: head }));
    }
    head
}

fn dump_list(head: &ListLink) -> String {
    let mut parts: Vec<String> = Vec::new();
    let mut cur = head;
    while let Some(node) = cur {
        parts.push(node.val.to_string());
        cur = &node.next;
    }
    format!("[{}]", parts.join(","))
}
`;
