<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# RUN and DEPLOY Your AI Studio App

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c23b72b9-a195-4788-a246-7993b02680e4

## LOCALHOST

**PREREQUISITES:**  Node.js

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini API key in .env.local
#    GEMINI_API_KEY=your_api_key_here

# 3. Start Vite development server
npm run dev

# Typecheck and build production bundle
npm run build

# Preview production build locally
npm run preview
```