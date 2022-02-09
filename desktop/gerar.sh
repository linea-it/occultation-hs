#!/bin/bash

pyinstaller main.py --icon=icon.ico --noconfirm --add-data='/home/usuario/.local/lib/python3.8/site-packages/PIL/:PIL' --add-data='pages:pages' --noconsole --name=sora-gui

rm sora-gui.7z

7z a -r -y -mx9 -t7z sora-gui.7z ./dist/sora-gui/.
