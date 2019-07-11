#!/bin/bash

FILEDIR="./www/.well-known/"
FILENAME="assetlinks.json"

if [ ! -d $FILEDIR ]; then
    mkdir $FILEDIR
fi

cp $FILENAME $FILEDIR
