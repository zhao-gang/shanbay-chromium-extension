#!/bin/sh
# make a zip file for chrome store

zip -r shanbay-chromium-extension \
    manifest.json *.html *.js *.css static/
