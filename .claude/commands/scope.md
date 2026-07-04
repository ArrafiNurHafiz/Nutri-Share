---
description: Load and confirm program scope from scope file. Usage: /scope <target>
---

# /scope

Load program scope from scope file. Creates scope context for recon and hunt.

```bash
# Uses tools/scope_loader.sh if available
bash tools/scope_loader.sh target.com
```

Automatically:
- Parses in-scope / out-of-scope targets
- Sets scope allowlist for safe hunting
- Checks for wildcard scope
