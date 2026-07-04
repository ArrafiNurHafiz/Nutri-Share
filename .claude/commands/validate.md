---
description: 7-Question Gate + 4 pre-submission gates for findings. Run before /report. Usage: /validate
---

# /validate

Validate findings before report submission.

Run the 7-Question Gate and 4 pre-submission gates on the current finding.

## 7-Question Gate
1. Is this DoS-only? → trivially reproducible? rate-limited?
2. What preconditions are required? Does victim need auth? do they need to visit a page? do they need to be on the same network?
3. Is the impact quantified? Which specific data type, how many records, what action?
4. Is this in scope? (include scope path)
5. Is there a chain requirement? Can the bug be exploited alone?
6. What's the exact HTTP request + response?
7. Is the fix path clear?

## 4 Pre-Submission Gates
1. Is request copy-pasteable?
2. Cannot reproduce with victim's token/IP?
3. Severity matches impact?
4. No "could potentially" in report?
