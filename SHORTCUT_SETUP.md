# iOS Shortcut Setup

This Shortcut adds "Drew's Hub Recipe" to your iPhone Share Sheet.
When you tap Share on TikTok or Instagram, you'll see it in the list.

---

## How to create the Shortcut manually (5 min)

1. Open the **Shortcuts** app on your iPhone
2. Tap **+** to create a new shortcut
3. Tap the shortcut name at the top → rename it **"Drew's Hub Recipe"**
4. Tap **Add Action**

### Add these actions in order:

**Action 1: Receive input**
- Search for: "Receive" → tap **Receive Input from Share Sheet**
- Input type: **URLs**
- If there's no input: **Continue**

**Action 2: Get text from input**
- The shared URL will be in the variable **Shortcut Input**

**Action 3: Get Contents of URL (the API call)**
- Search for: "Get Contents of URL"
- URL: `https://YOUR-VERCEL-URL.vercel.app/api/extract`
  *(replace with your actual Vercel URL)*
- Method: **POST**
- Request Body: **JSON**
- Add JSON field:
  - Key: `url`
  - Value: tap the variable selector → **Shortcut Input**

**Action 4: Get Dictionary Value**
- Search for: "Get Dictionary Value"
- Get **Value** for Key: `recipe`
- From: **Contents of URL** (the result from Action 3)

**Action 5: Get Dictionary Value (get the recipe name)**
- Get **Value** for Key: `name`
- From: **Dictionary** (result from Action 4)

**Action 6: Show Alert**
- Search for: "Show Alert"
- Title: **Recipe Imported!**
- Message: **Dictionary Value** (the name from Action 5)

**Action 7: Open URLs**
- Search for: "Open URLs"
- URL: `https://YOUR-PWA-URL.netlify.app`
  *(replace with your actual PWA URL)*

### Save and test:
- Tap **Done**
- Open TikTok → find a recipe video → tap Share
- Scroll the share sheet → tap **Drew's Hub Recipe**
- You'll see the loading spinner, then a confirmation alert

---

## Shortcut JSON (Advanced — import directly)

You can also import this shortcut by copying the JSON below into
the Shortcuts app using a shortcut importer:

```json
{
  "WFWorkflowName": "Drew's Hub Recipe",
  "WFWorkflowIcon": {
    "WFWorkflowIconGlyphNumber": 59511,
    "WFWorkflowIconStartColor": -1003450061
  },
  "WFWorkflowInputContentItemClasses": ["WFURLContentItem"],
  "WFWorkflowActions": [
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.getvalueforkey",
      "WFWorkflowActionParameters": {
        "WFInput": {"Value": {"Type": "ActionOutput", "OutputName": "Shortcut Input"}, "WFSerializationType": "WFTextTokenAttachment"},
        "WFDictionaryKey": "url"
      }
    }
  ]
}
```

Note: The JSON import method works best through the **Toolbox for Shortcuts** app
(free on App Store) which can import shortcut JSON directly.

---

## How the full flow works

1. You see a recipe on TikTok → tap Share → Drew's Hub Recipe
2. Shortcut sends the TikTok URL to your Vercel API
3. API tries to fetch the page content
4. If TikTok blocks the fetch (they often do), Claude uses the URL
   context + video title to generate a high-protein version of the recipe
5. Recipe is returned as JSON
6. Your hub opens — go to Recipes tab → the import will be waiting

## Tip: Pin to Share Sheet

After running the shortcut once from the share sheet:
- Scroll to the end of the share sheet
- Tap **Edit Actions**  
- Find **Drew's Hub Recipe** and tap the green + to pin it
- Now it always shows near the top of your share sheet ✓
