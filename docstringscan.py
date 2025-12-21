import os,re
root='bootstrap'
missing=[]
def has_doc(lines,i):
    k=i-1
    while k>=0:
        stripped=lines[k].strip()
        if not stripped:
            k-=1
            continue
        if '/**' in stripped:
            return True
        if stripped.startswith('*') or stripped.startswith('*/') or stripped.startswith('//'):
            k-=1
            continue
        return False
    return False
for dp, dn, fn in os.walk(root):
    dn[:] = [d for d in dn if d not in {'.git','node_modules','dist','e2e','venv'}]
    for name in fn:
        if not name.endswith('.js'):
            continue
        path=os.path.join(dp,name)
        with open(path,encoding='utf-8') as f:
            lines=f.readlines()
        for idx,line in enumerate(lines):
            if re.match(r"\s*class\b", line):
                if not has_doc(lines,idx):
                    missing.append((path,idx+1,'class'))
            elif re.match(r"\s*(?:async\s+)?function\b", line):
                if not has_doc(lines,idx):
                    missing.append((path,idx+1,'function'))
for path,line,obj in missing:
    print(f"{path}:{line} missing {obj} doc")
print(f"found {len(missing)} locations")

