/**
 * Reusable Go harness injected between the package/imports and the user's
 * function. Uses encoding/json (which marshals compactly, matching the
 * host-side `serializeExpected`). No generics (target Go 1.13), so there is one
 * reader per type. The generator (go/generator.ts) emits the `package main` +
 * imports and the `main()` that calls these.
 */
export const GO_HARNESS = String.raw`
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

type ListNode struct {
	Val  int
	Next *ListNode
}

func dump(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

func readInt(s string) int          { var v int; json.Unmarshal([]byte(s), &v); return v }
func readInt64(s string) int64      { var v int64; json.Unmarshal([]byte(s), &v); return v }
func readFloat(s string) float64    { var v float64; json.Unmarshal([]byte(s), &v); return v }
func readBool(s string) bool        { var v bool; json.Unmarshal([]byte(s), &v); return v }
func readString(s string) string    { var v string; json.Unmarshal([]byte(s), &v); return v }
func readIntArray(s string) []int   { var v []int; json.Unmarshal([]byte(s), &v); return v }
func readInt64Array(s string) []int64     { var v []int64; json.Unmarshal([]byte(s), &v); return v }
func readFloatArray(s string) []float64   { var v []float64; json.Unmarshal([]byte(s), &v); return v }
func readStringArray(s string) []string   { var v []string; json.Unmarshal([]byte(s), &v); return v }
func readBoolArray(s string) []bool       { var v []bool; json.Unmarshal([]byte(s), &v); return v }
func readIntArray2D(s string) [][]int     { var v [][]int; json.Unmarshal([]byte(s), &v); return v }
func readStringArray2D(s string) [][]string { var v [][]string; json.Unmarshal([]byte(s), &v); return v }

func buildTree(a []*int) *TreeNode {
	if len(a) == 0 || a[0] == nil {
		return nil
	}
	root := &TreeNode{Val: *a[0]}
	q := []*TreeNode{root}
	i := 1
	for len(q) > 0 && i < len(a) {
		node := q[0]
		q = q[1:]
		if i < len(a) {
			if a[i] != nil {
				node.Left = &TreeNode{Val: *a[i]}
				q = append(q, node.Left)
			}
			i++
		}
		if i < len(a) {
			if a[i] != nil {
				node.Right = &TreeNode{Val: *a[i]}
				q = append(q, node.Right)
			}
			i++
		}
	}
	return root
}

func readTree(s string) *TreeNode {
	var a []*int
	json.Unmarshal([]byte(s), &a)
	return buildTree(a)
}

func dumpTree(root *TreeNode) string {
	var out []interface{}
	q := []*TreeNode{root}
	for len(q) > 0 {
		node := q[0]
		q = q[1:]
		if node != nil {
			out = append(out, node.Val)
			q = append(q, node.Left, node.Right)
		} else {
			out = append(out, nil)
		}
	}
	for len(out) > 0 && out[len(out)-1] == nil {
		out = out[:len(out)-1]
	}
	return dump(out)
}

func buildList(a []int) *ListNode {
	dummy := &ListNode{}
	cur := dummy
	for _, v := range a {
		cur.Next = &ListNode{Val: v}
		cur = cur.Next
	}
	return dummy.Next
}

func readList(s string) *ListNode {
	return buildList(readIntArray(s))
}

func dumpList(head *ListNode) string {
	out := []int{}
	for c := head; c != nil; c = c.Next {
		out = append(out, c.Val)
	}
	return dump(out)
}

func readAllLines() []string {
	data, _ := ioutil.ReadAll(os.Stdin)
	return strings.Split(string(data), "\n")
}
`;
