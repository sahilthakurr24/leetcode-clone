/**
 * Reusable Python 3 harness injected before the user's function. Uses the
 * stdlib `json` module with compact separators so output matches the host-side
 * `serializeExpected`. TreeNode/ListNode get dedicated builders/serializers.
 */
export const PYTHON_HARNESS = String.raw`
import sys, json
from collections import deque
from typing import List, Optional, Dict

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def dumps(x):
    return json.dumps(x, separators=(',', ':'))

def build_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    q = deque([root])
    i = 1
    while q and i < len(arr):
        node = q.popleft()
        if i < len(arr):
            v = arr[i]; i += 1
            if v is not None:
                node.left = TreeNode(v); q.append(node.left)
        if i < len(arr):
            v = arr[i]; i += 1
            if v is not None:
                node.right = TreeNode(v); q.append(node.right)
    return root

def dump_tree(root):
    out = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node:
            out.append(node.val)
            q.append(node.left); q.append(node.right)
        else:
            out.append(None)
    while out and out[-1] is None:
        out.pop()
    return dumps(out)

def build_list(arr):
    dummy = ListNode(0)
    cur = dummy
    for v in arr:
        cur.next = ListNode(v); cur = cur.next
    return dummy.next

def dump_list(head):
    out = []
    c = head
    while c:
        out.append(c.val); c = c.next
    return dumps(out)

def read_all_lines():
    return sys.stdin.read().split('\n')
`;
