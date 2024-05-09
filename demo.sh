#!/bin/bash

if ! command -v firebase &> /dev/null
then
    echo "Firebase is not installed. Installing..."
    npm install -g firebase-tools
fi

firebase emulators:start &
node swagger.js