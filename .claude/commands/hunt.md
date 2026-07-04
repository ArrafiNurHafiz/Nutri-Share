---
description: Active vulnerability hunt — XSS, SQLi, SSRF, IDOR. Usage: /hunt target.com [--quick|--vuln-class CLASS]
---

# /hunt

Active vulnerability hunting using tools/hunt.py.

```bash
python3 tools/hunt.py --target target.com --scan-only
python3 tools/hunt.py --target target.com
python3 tools/hunt.py --target target.com --quick
```

Output: findings/<target>/
