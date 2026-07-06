/**
 * Reusable Java harness injected as `static` members of the `Main` class that
 * Judge0 compiles. Java has no built-in JSON, so this bundles a small parser,
 * typed converters, and canonical compact-JSON writers (`dump` overloads +
 * dumpTree/dumpList/dumpIntList/dumpStrList). Output matches the host-side
 * `serializeExpected`.
 */
export const JAVA_HARNESS = String.raw`
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode() {}
        TreeNode(int v) { val = v; }
    }
    static class ListNode {
        int val; ListNode next;
        ListNode() {}
        ListNode(int v) { val = v; }
    }

    static class JsonValue {
        int kind;              // 0 null, 1 bool, 2 num, 3 str, 4 arr
        boolean b;
        String raw = "";
        List<JsonValue> arr = new ArrayList<>();
        boolean isNull() { return kind == 0; }
    }

    static class Parser {
        String s; int i;
        Parser(String s) { this.s = s; this.i = 0; }
        void ws() { while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++; }
        JsonValue value() {
            ws();
            JsonValue v = new JsonValue();
            if (i >= s.length()) return v;
            char c = s.charAt(i);
            if (c == '[') return arr();
            if (c == '"') return str();
            if (c == 't' || c == 'f') return bool();
            if (c == 'n') { i += 4; return v; }
            return num();
        }
        JsonValue arr() {
            JsonValue v = new JsonValue(); v.kind = 4; i++; ws();
            if (i < s.length() && s.charAt(i) == ']') { i++; return v; }
            while (i < s.length()) {
                v.arr.add(value()); ws();
                if (i < s.length() && s.charAt(i) == ',') { i++; continue; }
                if (i < s.length() && s.charAt(i) == ']') { i++; break; }
                break;
            }
            return v;
        }
        JsonValue str() {
            JsonValue v = new JsonValue(); v.kind = 3; i++;
            StringBuilder b = new StringBuilder();
            while (i < s.length() && s.charAt(i) != '"') {
                char c = s.charAt(i++);
                if (c == '\\' && i < s.length()) {
                    char e = s.charAt(i++);
                    switch (e) {
                        case 'n': b.append('\n'); break;
                        case 't': b.append('\t'); break;
                        case 'r': b.append('\r'); break;
                        default: b.append(e);
                    }
                } else b.append(c);
            }
            if (i < s.length()) i++;
            v.raw = b.toString();
            return v;
        }
        JsonValue bool() {
            JsonValue v = new JsonValue(); v.kind = 1;
            if (s.charAt(i) == 't') { v.b = true; i += 4; } else { v.b = false; i += 5; }
            return v;
        }
        JsonValue num() {
            JsonValue v = new JsonValue(); v.kind = 2; int start = i;
            while (i < s.length()) {
                char c = s.charAt(i);
                if (Character.isDigit(c) || c == '-' || c == '+' || c == '.' || c == 'e' || c == 'E') i++;
                else break;
            }
            v.raw = s.substring(start, i);
            return v;
        }
    }
    static JsonValue parseJson(String s) { return new Parser(s).value(); }

    // ----- converters -----
    static int toInt(JsonValue v) { return Integer.parseInt(v.raw); }
    static long toLong(JsonValue v) { return Long.parseLong(v.raw); }
    static double toDouble(JsonValue v) { return Double.parseDouble(v.raw); }
    static boolean toBool(JsonValue v) { return v.kind == 1 ? v.b : v.raw.equals("true"); }
    static String toStr(JsonValue v) { return v.raw; }
    static char toChar(JsonValue v) { return v.raw.isEmpty() ? '\0' : v.raw.charAt(0); }

    static int[] toIntArray(JsonValue v) { int[] a = new int[v.arr.size()]; for (int i = 0; i < a.length; i++) a[i] = toInt(v.arr.get(i)); return a; }
    static long[] toLongArray(JsonValue v) { long[] a = new long[v.arr.size()]; for (int i = 0; i < a.length; i++) a[i] = toLong(v.arr.get(i)); return a; }
    static double[] toDoubleArray(JsonValue v) { double[] a = new double[v.arr.size()]; for (int i = 0; i < a.length; i++) a[i] = toDouble(v.arr.get(i)); return a; }
    static boolean[] toBoolArray(JsonValue v) { boolean[] a = new boolean[v.arr.size()]; for (int i = 0; i < a.length; i++) a[i] = toBool(v.arr.get(i)); return a; }
    static String[] toStringArray(JsonValue v) { String[] a = new String[v.arr.size()]; for (int i = 0; i < a.length; i++) a[i] = toStr(v.arr.get(i)); return a; }
    static char[] toCharArray(JsonValue v) { char[] a = new char[v.arr.size()]; for (int i = 0; i < a.length; i++) a[i] = toChar(v.arr.get(i)); return a; }
    static int[][] toIntArray2D(JsonValue v) { int[][] a = new int[v.arr.size()][]; for (int i = 0; i < a.length; i++) a[i] = toIntArray(v.arr.get(i)); return a; }
    static char[][] toCharArray2D(JsonValue v) { char[][] a = new char[v.arr.size()][]; for (int i = 0; i < a.length; i++) a[i] = toCharArray(v.arr.get(i)); return a; }
    static String[][] toStringArray2D(JsonValue v) { String[][] a = new String[v.arr.size()][]; for (int i = 0; i < a.length; i++) a[i] = toStringArray(v.arr.get(i)); return a; }
    static List<Integer> toIntList(JsonValue v) { List<Integer> l = new ArrayList<>(); for (JsonValue e : v.arr) l.add(toInt(e)); return l; }
    static List<String> toStrList(JsonValue v) { List<String> l = new ArrayList<>(); for (JsonValue e : v.arr) l.add(toStr(e)); return l; }

    static TreeNode buildTree(JsonValue v) {
        if (v.kind != 4 || v.arr.isEmpty() || v.arr.get(0).isNull()) return null;
        TreeNode root = new TreeNode(toInt(v.arr.get(0)));
        Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        int idx = 1;
        while (!q.isEmpty() && idx < v.arr.size()) {
            TreeNode node = q.poll();
            if (idx < v.arr.size()) { JsonValue lv = v.arr.get(idx++); if (!lv.isNull()) { node.left = new TreeNode(toInt(lv)); q.add(node.left); } }
            if (idx < v.arr.size()) { JsonValue rv = v.arr.get(idx++); if (!rv.isNull()) { node.right = new TreeNode(toInt(rv)); q.add(node.right); } }
        }
        return root;
    }
    static ListNode buildList(JsonValue v) {
        ListNode dummy = new ListNode(0); ListNode cur = dummy;
        for (JsonValue e : v.arr) { cur.next = new ListNode(toInt(e)); cur = cur.next; }
        return dummy.next;
    }

    // ----- writers (canonical compact JSON) -----
    static String esc(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\t': b.append("\\t"); break;
                case '\r': b.append("\\r"); break;
                default: b.append(c);
            }
        }
        b.append("\"");
        return b.toString();
    }
    static String dump(int x) { return Integer.toString(x); }
    static String dump(long x) { return Long.toString(x); }
    static String dump(boolean x) { return x ? "true" : "false"; }
    static String dump(double x) {
        if (x == Math.floor(x) && !Double.isInfinite(x) && Math.abs(x) < 1e15) return Long.toString((long) x);
        return Double.toString(x);
    }
    static String dump(String s) { return esc(s); }
    static String dump(char c) { return esc(String.valueOf(c)); }
    static String dump(int[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(a[i]); } return b.append("]").toString(); }
    static String dump(long[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(a[i]); } return b.append("]").toString(); }
    static String dump(double[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(dump(a[i])); } return b.append("]").toString(); }
    static String dump(boolean[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(dump(a[i])); } return b.append("]").toString(); }
    static String dump(char[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(dump(a[i])); } return b.append("]").toString(); }
    static String dump(String[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(dump(a[i])); } return b.append("]").toString(); }
    static String dump(int[][] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(dump(a[i])); } return b.append("]").toString(); }
    static String dump(char[][] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(dump(a[i])); } return b.append("]").toString(); }
    static String dump(String[][] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(dump(a[i])); } return b.append("]").toString(); }
    static String dumpIntList(List<Integer> a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.size(); i++) { if (i > 0) b.append(","); b.append(a.get(i)); } return b.append("]").toString(); }
    static String dumpStrList(List<String> a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.size(); i++) { if (i > 0) b.append(","); b.append(dump(a.get(i))); } return b.append("]").toString(); }
    static String dumpTree(TreeNode root) {
        if (root == null) return "[]";
        List<String> out = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) {
            TreeNode node = q.poll();
            if (node != null) { out.add(Integer.toString(node.val)); q.add(node.left); q.add(node.right); }
            else out.add("null");
        }
        while (!out.isEmpty() && out.get(out.size() - 1).equals("null")) out.remove(out.size() - 1);
        StringBuilder b = new StringBuilder("[");
        for (int i = 0; i < out.size(); i++) { if (i > 0) b.append(","); b.append(out.get(i)); }
        return b.append("]").toString();
    }
    static String dumpList(ListNode head) {
        StringBuilder b = new StringBuilder("["); boolean first = true;
        for (ListNode c = head; c != null; c = c.next) { if (!first) b.append(","); b.append(c.val); first = false; }
        return b.append("]").toString();
    }

    static String[] readAllLines() throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) lines.add(line);
        return lines.toArray(new String[0]);
    }
`;
