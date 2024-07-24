import os
import subprocess
import sys

print("Executou o sora gui n linha")
caminho = os.path.abspath(os.path.join(os.getcwd(),'gui','Sora-GUI.exe'))
print("-----------------")
print(caminho)
print("-----------------")
#result = subprocess.run([sys.executable, "-c", caminho],shell=True, check=True)
#wd = os.getcwd()
#os.chdir(os.path.dirname(caminho))
#os.environ['PATH'] = os.environ['PATH'] + r';'+os.path.dirname(caminho)
#print(os.environ['PATH'])
#result = subprocess.run(['Sora-GUI.exe'],shell=True, check=True)
result = subprocess.Popen(caminho, cwd=os.path.dirname(caminho))
result.wait()
#os.chdir(wd)
print(result)
print("test")

