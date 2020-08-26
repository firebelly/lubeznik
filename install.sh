#!/usr/bin/env bash

# starter template for craft 3 sites

read -p "Project name (e.g. cgre):" project

printf "Updating config.json with %s.localhost\n" $project
sed -i "" "s/fb-craftstarter/${theme}/g" config.json

read -p "Create ${project}_dev database? (y/n) :" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Running: mysql -u root -p -e \"create database ${project}_dev\""
    mysql -u root -p -e "create database ${project}_dev";
fi

read -p "Install Craft? (y/n):" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
	echo "Installing Craft..."
	composer create-project craftcms/craft .
fi

echo "Installing Yarn build system..."
cd assets
yarn
yarn build
