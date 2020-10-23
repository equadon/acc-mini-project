#!/bin/bash

# install openstackclient

sudo add-apt-repository cloud-archive:stein
sudo add-apt-repository cloud-archive:rocky
sudo apt update && sudo apt dist-upgrade
sudo apt install python3-openstackclient
sudo apt install python-openstackclient
sudo apt-get install python-dev python-pip
sudo pip install python-openstackclient
sudo apt install python3-heatclient
pip install future

