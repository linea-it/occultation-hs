rem set nome=asyncworks
rem pyinstaller %nome%.spec --noconfirm
rem mklink /D .\dist\%nome%\lib-dynload ..\..\venv\Lib\site-packages



rem cxfreeze -c asyncqueuetasks.py --target-dir dist --excludes=tkinter --includes=sora --include-path=venv\Lib\site-packages
rem py compila_all_venv.pyinstaller

python setup.py build
copy geos\. build\exe.win-amd64-3.9\
mkdir build\exe.win-amd64-3.9\mapas

