"""Translation via translate-shell (Bing engine, free)."""
import subprocess

# Japanese Unicode ranges
_JA_RANGES = [
    (0x3040, 0x30FF),   # Hiragana + Katakana
    (0x4E00, 0x9FFF),   # CJK Unified
    (0x3000, 0x303F),   # CJK Punctuation
    (0xFF00, 0xFFEF),   # Halfwidth/Fullwidth forms
]


def has_japanese(text: str) -> bool:
    if not text:
        return False
    return any(
        any(lo <= ord(c) <= hi for lo, hi in _JA_RANGES)
        for c in text
    )


def translate(text: str, src: str = "ja", dest: str = "ru") -> str:
    """Translate text. Returns original on failure or if no Japanese detected."""
    if not text or not has_japanese(text):
        return text
    try:
        result = subprocess.run(
            ["trans", "-b", "-e", "bing", "-s", src, "-t", dest, text],
            capture_output=True, text=True, timeout=15
        )
        translated = result.stdout.strip()
        if translated and translated != text and "ERROR" not in translated:
            return translated
    except Exception:
        pass
    return text
