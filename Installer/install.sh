#!/bin/bash

INSTALL_FOLDER_NAME=directcam
PATH_INSTALL=~/$INSTALL_FOLDER_NAME
ICON_EXE=~/Desktop/directcam.desktop

sudo apt-get -y update 
sudo apt-get -y install sed wget rpi.gpio xdotool unclutter xterm sed wmctrl
sudo pip install bottle

sudo rm -rf $TEMP_DIR
sudo rm -rf $PATH_INSTALL

mkdir $PATH_INSTALL

cd $PATH_INSTALL/..
echo "buscando ultima versao do directcam"
wget https://11tech.com.br/azadive/directcam.tar.gz -q -O directcam.tar.gz
tar -zxf directcam.tar.gz -C $INSTALL_FOLDER_NAME
rm directcam.tar.gz
if [[ ! -e $INSTALL_FOLDER_NAME ]]; then
    echo "Fail in download directcam"
    exit
fi
cd $PATH_INSTALL

sudo chmod +x *.sh

sudo mv /usr/share/plymouth/themes/pix/splash.png /usr/share/plymouth/themes/pix/splash.png.old
sudo cp splash.png /usr/share/plymouth/themes/pix/

str="${PATH_INSTALL//\//\\/}"

sed "s/_PATH_INSTALL_/$str/g" kiosk.service.model > kiosk.service
sed "s/_PATH_INSTALL_/$str/g" directcam.service.model > directcam.service
sed "s/_PATH_INSTALL_/$str/g" directcam.desktop.model > directcam.desktop

rm *.model
sudo cp *.service /lib/systemd/system/

sudo systemctl enable kiosk
sudo systemctl enable directcam
sudo systemctl start kiosk
sudo systemctl start directcam

mkdir -p ~/.config/pcmanfm/LXDE-pi
mkdir -p ~/.config/pcmanfm/default
cp desktop-items-0.conf ~/.config/pcmanfm/LXDE-pi/desktop-items-0.conf 
cp desktop-items-0.conf ~/.config/pcmanfm/default/desktop-items-0.conf 
sudo pcmanfm --profile=LXDE-pi --desktop

mkdir -p ~/.config/lxpanel/LXDE-pi/panels
cp panel ~/.config/lxpanel/LXDE-pi/panels/panel 
sudo lxpanel --profile LXDE-pi

mv directcam.desktop "$ICON_EXE"
mkdir -p ~/.config/autostart
cp "$ICON_EXE" ~/.config/autostart/directcam.desktop 

reboot
