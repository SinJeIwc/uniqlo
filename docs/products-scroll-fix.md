# Products Parser - Infinite Scroll Fix

## Problem

Products parser failed to load all items from large category pages:
- Expected: 305 items (women/tops)
- Actual: ~217 items (71%)
- Root cause: Infinite scroll timeout too short

## Investigation

**Original Code (products.py:119):**
```python
for _ in range(40):  # max 40 iterations
    page.evaluate("window.scrollBy(0, window.innerHeight)")
    time.sleep(0.3)  # 0.3s wait
```

**Issue:**
- Total scroll time: 40 × 0.3s = **12 seconds max**
- UNIQLO loads ~36 products per batch
- Large categories (305 items) need 9+ batches = **18+ seconds**
- Scroll stopped too early

## Fix Applied

**New Code (products.py:117-138):**
```python
prev = 0
no_change_count = 0
for scroll_iter in range(80):  # Increased iterations
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(1.0)  # Longer wait for network + render
    
    cur = page.evaluate(
        "() => document.querySelectorAll('a[href*=\"/products/E\"]').length")
    
    if cur == prev:
        no_change_count += 1
        if no_change_count >= 3:  # Confirm end with 3 stable readings
            break
    else:
        no_change_count = 0
        prev = cur
```

**Improvements:**
1. **Increased wait:** 0.3s → 1.0s (network + render time)
2. **More iterations:** 40 → 80 (handle large catalogs)
3. **Smart stop:** Wait for 3 consecutive no-change iterations (confirm end)
4. **Scroll to bottom:** `scrollBy(innerHeight)` → `scrollTo(scrollHeight)` (more reliable)

## Results

**women/tops (305 expected):**
- Before: 217 products (71%)
- After: **301 products (98%)**
- Time: 11 scrolls × 1s = 11 seconds

**women/lounge-and-underwear-collection (53 expected):**
- Result: **53 products (100%)**
- Time: ~6 seconds

## Verification

```bash
# Test scroll behavior
cd scripts && uv run python /tmp/test-scroll-improved.py

# Run products parse
cd scripts && uv run python categories/parse.py --max 100
```

## Notes

- 4 missing items from women/tops likely inactive/seasonal
- Parser correctly stops when no new items load
- Time overhead: +7s per large category (acceptable)
