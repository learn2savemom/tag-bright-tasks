

## Run locally

Prerequisites: Node.js 18 or newer (this repo uses Vite 5). You can install Node with [nvm](https://github.com/nvm-sh/nvm).

```bash
# If you use nvm, load it in your shell:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# From the repository root:
cd tag-bright-tasks
npm install
npm run dev
```

The dev server listens on [http://localhost:8080/](http://localhost:8080/) (see `vite.config.ts`).
