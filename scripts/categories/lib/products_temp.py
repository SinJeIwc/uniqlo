# This script replaces parse_products function (lines 18-147) with the fixed version
import sys

# Read original file
with open('products.py', 'r') as f:
    lines = f.readlines()

# Read new function
with open('products_new.py', 'r') as f:
    new_content = f.read()

# Find function boundaries
start_line = None
end_line = None

for i, line in enumerate(lines):
    if line.strip().startswith('def parse_products('):
        start_line = i
    elif start_line is not None and line.strip().startswith('def _parse_parallel('):
        end_line = i
        break

if start_line is None or end_line is None:
    print("ERROR: Could not find function boundaries")
    sys.exit(1)

print(f"Found parse_products at lines {start_line+1}-{end_line}")

# Build new file
new_lines = (
    lines[:start_line] +  # Before function
    [new_content[new_content.index('def parse_products'):]] +  # New function
    ['\n\n'] +  # Spacing
    lines[end_line:]  # After function
)

# Write result
with open('products_fixed.py', 'w') as f:
    f.writelines(new_lines)

print("✓ Written to products_fixed.py")
