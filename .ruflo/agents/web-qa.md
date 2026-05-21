# Agent: DoubleMark Web QA

After deploy to GitHub Pages, verify:

1. Open `https://shamsyyy.github.io/doublemarksite/download` (logged in if possible)
2. Latest version block visible with download button
3. Archive section lists older versions with warnings
4. Links to `/doublemarksite/downloads/DoubleMarkSetup-2.1.1.exe` and archive paths work (404 only if file missing — expected until installer uploaded)
5. `https://shamsyyy.github.io/doublemarksite/updates/update.json` returns valid JSON
6. Logo and favicon still DoubleMark branding

Report pass/fail per item.
