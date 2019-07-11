#!/bin/bash

FILEDIR="./www/.well-known/"
FILENAME="assetlinks.json"

if [ ! -f $FILEDIR$FILENAME ]; then
    mkdir -p $FILEDIR
    cp $FILENAME $FILEDIR
fi
