#!/bin/bash
# LIBRARY · review stills: renders the <Comp>Samples composition (3 moments per beat) at half size → out/<id>-samples/sheet-NN.jpg (4×4 each)
# usage: tools/samples.sh <id> <SamplesComposition>
[[ "$1" =~ ^[A-Za-z0-9_-]+$ && "$2" =~ ^[A-Za-z0-9_-]+$ ]] || { echo "usage: tools/samples.sh <id> <SamplesComposition> (letters, digits, - and _)"; exit 1; }
cd "$(dirname "$0")/.."
o=out/$1-samples; rm -rf $o; mkdir -p $o
npx remotion render src/index.ts $2 $o --sequence --image-format=jpeg --scale=0.5 --concurrency=4 --log=error </dev/null || exit 1
cd $o && ffmpeg -loglevel error -y -framerate 1 -pattern_type glob -i 'element-*.jpeg' -vf "scale=480:270,drawtext=text='%{n}':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black,tile=4x4" sheet-%02d.jpg && ls sheet-*.jpg | wc -l
