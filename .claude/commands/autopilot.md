---
description: Autonomous hunt loop — scope → recon → rank → hunt → validate → report. Usage: /autopilot target.com [--paranoid|--normal|--yolo|--quick]
---

# /autopilot

Autonomous hunt loop with scope safety and configurable checkpoints.

```
/autopilot target.com         # paranoid mode (default)
/autopilot target.com --normal
/autopilot target.com --yolo
/autopilot target.com --quick
```

Pipeline: SCOPE → RECON → RANK → HUNT → VALIDATE → REPORT → CHECKPOINT

Safety: scope-checked, rate-limited, reports NEVER auto-submitted.
