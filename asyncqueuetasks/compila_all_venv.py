import py_compile
import os

def listFiles(root): # listdir
    allFiles = []; walk = [root]
    while walk:
        folder = walk.pop(0)+"/"
        items = os.listdir(folder) # items = folders + files
        for i in items: 
            i=folder+i 
            if os.path.isdir(i):
                walk.append(i)
            elif i.endswith(".py"):
                allFiles.append(i)
    return allFiles

origem='venv/Lib/site-packages'
destino='dist/lib'
files=listFiles(origem) 
print(files)

for file in files:
    nome = file.replace(origem,destino).replace('.py','.pyc')
    if not os.path.exists(nome):
        print(file,' -> ',nome)
        py_compile.compile(file, nome)