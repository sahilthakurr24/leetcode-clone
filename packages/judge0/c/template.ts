/**
 * Reusable C harness. C has no JSON and uses LeetCode's size-parameter calling
 * convention, so this provides lightweight parsers/printers and a line splitter.
 * v1 supports scalars (int/double/bool/char), strings (char*), and int arrays
 * (int* with a size, returned via `returnSize`). 2D arrays, trees and lists are
 * not yet supported for C.
 */
export const C_HARNESS = String.raw`
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

struct TreeNode { int val; struct TreeNode *left; struct TreeNode *right; };
struct ListNode { int val; struct ListNode *next; };
typedef struct TreeNode TreeNode;
typedef struct ListNode ListNode;

static char **g_lines;
static int g_line_count;

static void read_all_lines(void) {
    size_t cap = 1024, len = 0;
    char *buf = (char *)malloc(cap);
    int c;
    while ((c = getchar()) != EOF) {
        if (len + 1 >= cap) { cap *= 2; buf = (char *)realloc(buf, cap); }
        buf[len++] = (char)c;
    }
    buf[len] = 0;

    int lc = 0, lcap = 8;
    char **lines = (char **)malloc(sizeof(char *) * lcap);
    char *start = buf;
    for (size_t i = 0; i <= len; i++) {
        if (buf[i] == '\n' || buf[i] == 0) {
            char at_end = (buf[i] == 0);
            buf[i] = 0;
            if (lc == lcap) { lcap *= 2; lines = (char **)realloc(lines, sizeof(char *) * lcap); }
            lines[lc++] = start;
            start = &buf[i + 1];
            if (at_end) break;
        }
    }
    g_lines = lines;
    g_line_count = lc;
}

static int parse_int(const char *s) { return (int)strtol(s, NULL, 10); }
static long parse_long(const char *s) { return strtol(s, NULL, 10); }
static double parse_double(const char *s) { return strtod(s, NULL); }
static bool parse_bool(const char *s) { return strstr(s, "true") != NULL; }

static char *parse_string(const char *s) {
    const char *start = strchr(s, '"');
    if (!start) return strdup(s);
    start++;
    const char *end = strrchr(s, '"');
    size_t len = (end > start) ? (size_t)(end - start) : 0;
    char *out = (char *)malloc(len + 1);
    memcpy(out, start, len);
    out[len] = 0;
    return out;
}

static char parse_char(const char *s) {
    char *str = parse_string(s);
    char c = str[0];
    free(str);
    return c;
}

static int *parse_int_array(const char *s, int *size) {
    int cap = 8, n = 0;
    int *arr = (int *)malloc(sizeof(int) * cap);
    const char *p = s;
    while (*p) {
        if (*p == '-' || (*p >= '0' && *p <= '9')) {
            char *endp;
            long val = strtol(p, &endp, 10);
            if (n == cap) { cap *= 2; arr = (int *)realloc(arr, sizeof(int) * cap); }
            arr[n++] = (int)val;
            p = endp;
        } else {
            p++;
        }
    }
    *size = n;
    return arr;
}

static void print_int(int x) { printf("%d", x); }
static void print_long(long x) { printf("%ld", x); }
static void print_double(double x) {
    if (x == (long long)x) printf("%lld", (long long)x);
    else printf("%g", x);
}
static void print_bool(bool x) { printf(x ? "true" : "false"); }
static void print_string(const char *s) {
    putchar('"');
    for (const char *p = s; *p; p++) {
        if (*p == '"' || *p == '\\') putchar('\\');
        putchar(*p);
    }
    putchar('"');
}
static void print_char(char c) { char t[2] = {c, 0}; print_string(t); }
static void print_int_array(const int *a, int n) {
    putchar('[');
    for (int i = 0; i < n; i++) { if (i) putchar(','); printf("%d", a[i]); }
    putchar(']');
}

// ----- TreeNode / ListNode -----
static struct TreeNode *new_tree_node(int v) {
    struct TreeNode *n = (struct TreeNode *)malloc(sizeof(struct TreeNode));
    n->val = v; n->left = NULL; n->right = NULL;
    return n;
}

static struct TreeNode *parse_tree(const char *s) {
    int cap = 8, n = 0;
    int *vals = (int *)malloc(sizeof(int) * cap);
    int *isnull = (int *)malloc(sizeof(int) * cap);
    const char *p = s;
    while (*p && *p != '[') p++;
    if (*p == '[') p++;
    while (*p && *p != ']') {
        while (*p == ' ' || *p == ',' || *p == '\t') p++;
        if (*p == ']' || !*p) break;
        if (n == cap) { cap *= 2; vals = (int *)realloc(vals, sizeof(int) * cap); isnull = (int *)realloc(isnull, sizeof(int) * cap); }
        if (strncmp(p, "null", 4) == 0) { isnull[n] = 1; vals[n] = 0; n++; p += 4; }
        else { char *endp; long v = strtol(p, &endp, 10); isnull[n] = 0; vals[n] = (int)v; n++; p = endp; }
    }
    if (n == 0 || isnull[0]) { free(vals); free(isnull); return NULL; }
    struct TreeNode *root = new_tree_node(vals[0]);
    struct TreeNode **q = (struct TreeNode **)malloc(sizeof(struct TreeNode *) * n);
    int head = 0, tail = 0;
    q[tail++] = root;
    int idx = 1;
    while (head < tail && idx < n) {
        struct TreeNode *node = q[head++];
        if (idx < n) { if (!isnull[idx]) { node->left = new_tree_node(vals[idx]); q[tail++] = node->left; } idx++; }
        if (idx < n) { if (!isnull[idx]) { node->right = new_tree_node(vals[idx]); q[tail++] = node->right; } idx++; }
    }
    free(vals); free(isnull); free(q);
    return root;
}

static void print_tree(struct TreeNode *root) {
    if (!root) { printf("[]"); return; }
    int qcap = 16, qh = 0, qt = 0;
    struct TreeNode **q = (struct TreeNode **)malloc(sizeof(struct TreeNode *) * qcap);
    int ocap = 16, on = 0;
    int *ov = (int *)malloc(sizeof(int) * ocap);
    int *onull = (int *)malloc(sizeof(int) * ocap);
    q[qt++] = root;
    while (qh < qt) {
        struct TreeNode *node = q[qh++];
        if (on == ocap) { ocap *= 2; ov = (int *)realloc(ov, sizeof(int) * ocap); onull = (int *)realloc(onull, sizeof(int) * ocap); }
        if (node) {
            ov[on] = node->val; onull[on] = 0; on++;
            if (qt + 2 > qcap) { qcap *= 2; q = (struct TreeNode **)realloc(q, sizeof(struct TreeNode *) * qcap); }
            q[qt++] = node->left;
            q[qt++] = node->right;
        } else {
            ov[on] = 0; onull[on] = 1; on++;
        }
    }
    while (on > 0 && onull[on - 1]) on--;
    putchar('[');
    for (int i = 0; i < on; i++) { if (i) putchar(','); if (onull[i]) printf("null"); else printf("%d", ov[i]); }
    putchar(']');
    free(q); free(ov); free(onull);
}

static struct ListNode *parse_list(const char *s) {
    int size;
    int *arr = parse_int_array(s, &size);
    struct ListNode dummy; dummy.next = NULL;
    struct ListNode *cur = &dummy;
    for (int i = 0; i < size; i++) {
        struct ListNode *node = (struct ListNode *)malloc(sizeof(struct ListNode));
        node->val = arr[i]; node->next = NULL;
        cur->next = node; cur = node;
    }
    free(arr);
    return dummy.next;
}

static void print_list(struct ListNode *head) {
    putchar('[');
    int first = 1;
    for (struct ListNode *c = head; c; c = c->next) { if (!first) putchar(','); printf("%d", c->val); first = 0; }
    putchar(']');
}
`;
