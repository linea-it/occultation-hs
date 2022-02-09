#!/bin/bash

rem pyinstaller main.py  --icon=icon.ico --noconfirm --add-data "pages;pages" --noconsole --name=sora-gui
pyinstaller main.py  --noconfirm --add-data "pages;pages" --noconsole --name=sora-gui

rm sora-gui.7z

7z a -r -y -mx9 -t7z sora-gui.7z .\dist\sora-gui\.
