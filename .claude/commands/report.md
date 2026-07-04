---
description: Generate submission-ready bug bounty report (H1/Bugcrowd/Intigriti/Immunefi). Run /validate first. Usage: /report
---

# /report

Generate submission-ready bug bounty report.

Run `/validate` first. All 4 gates must pass.

Generates:
1. Title: `[Bug Class] in [Endpoint] allows [actor] to [impact]`
2. Summary (impact-first)
3. CVSS 3.1 score + vector
4. Steps to Reproduce
5. Impact quantification
6. Recommended fix
7. Supporting materials

Saved to: findings/<target-or-program>-<bug-class>/
