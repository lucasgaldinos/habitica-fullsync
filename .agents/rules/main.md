---
trigger: always_on
---

1. Always use the built-in tools for editing, this way the changes can be properly reviewed. Avoid `cat`, `grep` for **editing files**. You can use `tree`, `eza`, `rtk <command>`, `ls` and others when EXPLORING.
2. Avoid insane trial and error loops for fixing `npm run build`. Ask me with #askQuestions tool how to proceed. I can provide files and guidance for you, as well as question your thought logic. Use web tools to search when you do not know what to do.
3. Reforcing that you should always prefer searching in the workspace docs or asking the user, rather than fixing with trial and error.
4. **Strict Code Quality, SOLID Principles, & No Suppressions:**
   1. **SOLID Architecture:** Every architectural or code change MUST explicitly respect SOLID principles. Do not introduce or ignore "God Objects." Ensure Interface Segregation and Dependency Inversion are applied so that UI components (like settings tabs) are decoupled from heavy domain classes.
   2. **No Suppressions:** Absolutely NO `// @ts-ignore`, `// eslint-disable`, or similar suppression comments. If the compiler or linter yells, you must fix the underlying logic, types, or configuration. Do not duct tape it.
   3. **DRY Testing:** Do not duplicate large data payloads or mock strings in test files. Always load them dynamically from external mock files to maintain a single source of truth.
   4. **Comprehensive Linting:** Ensure all toolchain configurations (e.g., `.mjs` files) and `tests/` directories are explicitly included in linting and type-checking pipelines.
5. Clear naming for classes, variables, interfaces and everything else.
6. Take care when, where and how typing, casting and JSDocs documenting.
