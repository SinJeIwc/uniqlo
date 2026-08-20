# Banner Parsing Analysis

## Current Implementation

### Banner Component (`frontend/src/components/shared/Banner.tsx`)

Accepts:
- `videoUrl` - video source
- `videoPoster` - video poster image
- `imagePc` - desktop image
- `imageSp` - mobile image  
- `title` - main heading
- `subtitle` - overlay text

### Parser (`scripts/categories/lib/crawl.py:138-158`)

Extracts from MediaBanner:
```javascript
const banner = document.querySelector('[_type="MediaBanner"]');
const img = banner.querySelector('img');
const video = banner.querySelector('video');
const ps = banner.querySelectorAll('p[data-testid="ITOTypography"]');

return {
    image_sp: img?.getAttribute('smallmediumimageurl') || null,
    image_pc: img?.getAttribute('largeimageurl') || null,
    video_url: video?.getAttribute('data-src') || video?.getAttribute('src') || null,
    video_poster: video?.getAttribute('poster') || null,
    subtitle: ps[1]?.textContent?.trim() || null,
};
```

## Issues Found

### 1. ❌ Missing PC/SP Images When Video Present

**Problem:** Parser looks for `<img>` tag, but when video exists, images are in:
- `video[poster]` attribute (fallback)
- `<picture><source>` tags (responsive)

**Example (bratop):**
```html
<video data-src="...video.mp4" poster="kv-w-bratop-image0409-pc-jp.jpg">
<picture>
  <source media="(max-width: 640px)" srcSet="...sp.jpg">
  <img src="...pc.jpg" alt="...">
</picture>
```

**Current DB:**
```
bratop | VIDEO | (no PC) | (no SP) | おでかけブラトップ
```

**Expected:**
```
bratop | VIDEO | PC ✓ | SP ✓ | おでかけブラトップ
```

### 2. ❌ Missing Modal Content

**What's on site:**
- Modal button "ブラトップとは？" (What is Bratop?)
- Modal video with explanation
- Related articles with images

**Not parsed:**
- Modal trigger
- Modal content
- Related links

### 3. ✅ What Works

- ✅ Video URL extraction
- ✅ Video poster extraction  
- ✅ Subtitle text extraction
- ✅ Basic structure detection

## Recommended Fixes

### Fix 1: Better Image Extraction

```javascript
// CURRENT (crawl.py:146-147)
image_sp: img?.getAttribute('smallmediumimageurl') || null,
image_pc: img?.getAttribute('largeimageurl') || null,

// SHOULD BE:
const picture = banner.querySelector('picture');
const sources = picture?.querySelectorAll('source') || [];
const spSource = Array.from(sources).find(s => 
  s.getAttribute('media')?.includes('max-width')
);

image_sp: spSource?.getAttribute('srcSet') || 
          img?.getAttribute('smallmediumimageurl') || 
          null,
          
image_pc: img?.getAttribute('src') || 
          img?.getAttribute('largeimageurl') || 
          video?.getAttribute('poster') || 
          null,
```

### Fix 2: Extract Modal Data (Optional)

```javascript
const modal = banner.closest('[_type="MediaBanner"]')?.querySelector('[_type="ButtonWithModal"]');
const modalTitle = modal?.textContent?.trim();
// Store in separate field: modal_title, modal_video_url, etc.
```

### Fix 3: Validation

Add check after extraction:
```python
if media and media.get("video_url"):
    if not media.get("image_pc") and media.get("video_poster"):
        media["image_pc"] = media["video_poster"]  # Fallback
```

## Testing Pages

1. **Video banner:** `/women/tops/bratop`
   - Has: video + poster + subtitle
   - Missing: PC/SP images

2. **Image banner:** `/women/lounge-and-underwear-collection`
   - Has: PC/SP images + subtitle
   - Check: proper extraction

3. **Mixed content:** Check other categories

## Migration Plan

1. ✅ **Document current state** (this file)
2. ⬜ **Fix parser** (crawl.py:146-147)
3. ⬜ **Test extraction** on bratop page
4. ⬜ **Re-crawl affected categories**
5. ⬜ **Verify Banner component** renders correctly
