import os

d = 'dataset-preprocessing/train'
counts = []
for f in os.listdir(d):
    path = os.path.join(d, f)
    if os.path.isdir(path):
        counts.append((f, len(os.listdir(path))))

counts.sort(key=lambda x: x[1], reverse=True)

with open('disease_counts.txt', 'w') as out:
    for name, c in counts:
        out.write(f"{c} - {name}\n")
