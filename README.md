# Drew's Recipe API

Backend for the iOS Shortcut that imports recipes from TikTok/Instagram into Drew's Fitness Hub.

## Deploy to Vercel (5 minutes)

### Step 1 — Upload this folder to GitHub
1. Go to github.com → New repository → name it `drews-recipe-api` → Public → Create
2. Upload all files from this folder (drag & drop on the GitHub website)
3. Commit changes

### Step 2 — Deploy to Vercel
1. Go to vercel.com → Add New Project
2. Import your `drews-recipe-api` GitHub repo
3. Click Deploy (no settings to change)
4. Your API URL will be: `https://drews-recipe-api.vercel.app`

### Step 3 — Add your Anthropic API Key
1. In Vercel → Your project → Settings → Environment Variables
2. Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com
3. Click Save → Go to Deployments → Redeploy

### Step 4 — Install the iOS Shortcut
See SHORTCUT_SETUP.md

## API Usage

POST /api/extract
Content-Type: application/json

{ "url": "https://www.tiktok.com/..." }

Returns:
{
  "success": true,
  "recipe": {
    "name": "Recipe Name",
    "cal": 520,
    "protein": 45,
    ...full recipe object...
  }
}
