# Repo for bug report
This repository was created to help recreate an IDE bug.

To see the type mismatch error that doesn't fit on a screen:
1. Open `./src/server/api/routers/questions.ts`.
2. Go to line 68.
3. Hover over `data` and see the unscrollable, not fully-vievable type mismatch popup.

![image](https://github.com/jkazimierczak/type-mismatch-popup/assets/77862767/e3fe8f39-3da7-4f4c-a0d6-572bfed5ceeb)
