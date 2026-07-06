/**
 * Reusable JavaScript (Node.js) harness injected before the user's function.
 * JSON is native, so scalars/arrays use JSON.parse / JSON.stringify directly;
 * only TreeNode/ListNode need dedicated builders/serializers. Output is compact
 * JSON so it matches the host-side `serializeExpected`.
 */
export const JS_HARNESS = String.raw`
// ----- LeetCode node types -----
function TreeNode(val, left, right) {
  this.val = val === undefined ? 0 : val;
  this.left = left === undefined ? null : left;
  this.right = right === undefined ? null : right;
}
function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

function buildTree(arr) {
  if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const q = [root];
  let i = 1;
  while (q.length && i < arr.length) {
    const node = q.shift();
    if (i < arr.length) { const v = arr[i++]; if (v !== null) { node.left = new TreeNode(v); q.push(node.left); } }
    if (i < arr.length) { const v = arr[i++]; if (v !== null) { node.right = new TreeNode(v); q.push(node.right); } }
  }
  return root;
}
function dumpTree(root) {
  const out = [];
  const q = [root];
  while (q.length) {
    const node = q.shift();
    if (node) { out.push(node.val); q.push(node.left); q.push(node.right); }
    else out.push(null);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return JSON.stringify(out);
}

function buildList(arr) {
  const dummy = new ListNode(0);
  let cur = dummy;
  for (const v of arr) { cur.next = new ListNode(v); cur = cur.next; }
  return dummy.next;
}
function dumpList(head) {
  const out = [];
  for (let c = head; c; c = c.next) out.push(c.val);
  return JSON.stringify(out);
}

// ----- stdin (one JSON argument per line) -----
function readAllLines() {
  return require("fs").readFileSync(0, "utf8").split("\n");
}
`;
