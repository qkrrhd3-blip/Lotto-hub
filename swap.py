import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the boundaries
features_start = content.find('<section id="features" class="features">')
features_end = content.find('</section>', features_start) + len('</section>\n')

generate_start = content.find('<section id="generate" class="generate-section">')
generate_end = content.find('</section>', generate_start) + len('</section>\n')

# Ensure we found both sections
if features_start != -1 and generate_start != -1:
    features_block = content[features_start:features_end]
    generate_block = content[generate_start:generate_end]

    # Swap them
    if features_start < generate_start:
        # features is before generate
        part1 = content[:features_start]
        part2 = content[features_end:generate_start]
        part3 = content[generate_end:]
        new_content = part1 + generate_block + part2 + features_block + part3
    else:
        # generate is before features
        part1 = content[:generate_start]
        part2 = content[generate_end:features_start]
        part3 = content[features_end:]
        new_content = part1 + features_block + part2 + generate_block + part3

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Swapped successfully.")
else:
    print("Could not find one or both sections.")
