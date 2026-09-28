/**
 * Optimal Binary Search Tree (OBST) — CLRS dynamic programming.
 *
 * Course algorithm demonstration only.
 * This module is NOT used by search, seat selection, payment or booking storage.
 *
 * Time complexity: O(n³)
 * Space complexity: O(n²)
 *
 * keys: array of n comparable keys (index 0..n-1)
 * p: successful-search probabilities, length n (p[i] for keys[i])
 * q: unsuccessful-search probabilities, length n+1 (dummy keys d0..dn)
 */
export function buildOptimalBST(keys, p, q) {
  const n = keys.length;
  if (!n) {
    return {
      n: 0,
      cost: 0,
      costTable: [],
      weightTable: [],
      rootTable: [],
      optimalRoot: null,
      tree: null,
    };
  }
  if (p.length !== n || q.length !== n + 1) {
    throw new Error('OBST requires p.length === keys.length and q.length === keys.length + 1');
  }

  const e = Array.from({ length: n + 2 }, () => Array(n + 1).fill(0));
  const w = Array.from({ length: n + 2 }, () => Array(n + 1).fill(0));
  const root = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= n + 1; i += 1) {
    e[i][i - 1] = q[i - 1];
    w[i][i - 1] = q[i - 1];
  }

  for (let len = 1; len <= n; len += 1) {
    for (let i = 1; i <= n - len + 1; i += 1) {
      const j = i + len - 1;
      e[i][j] = Number.POSITIVE_INFINITY;
      w[i][j] = w[i][j - 1] + p[j - 1] + q[j];
      for (let r = i; r <= j; r += 1) {
        const cost = e[i][r - 1] + e[r + 1][j] + w[i][j];
        if (cost < e[i][j]) {
          e[i][j] = cost;
          root[i][j] = r;
        }
      }
    }
  }

  function buildTree(i, j) {
    if (j < i) {
      return { type: 'dummy', index: i - 1, label: `d${i - 1}` };
    }
    const r = root[i][j];
    return {
      type: 'key',
      index: r,
      key: keys[r - 1],
      left: buildTree(i, r - 1),
      right: buildTree(r + 1, j),
    };
  }

  return {
    n,
    cost: e[1][n],
    costTable: e,
    weightTable: w,
    rootTable: root,
    optimalRoot: keys[root[1][n] - 1],
    optimalRootIndex: root[1][n],
    tree: buildTree(1, n),
  };
}

export const OBST_META = {
  name: 'Optimal Binary Search Tree',
  time: 'O(n³)',
  space: 'O(n²)',
  usedInBooking: false,
};
