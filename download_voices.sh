#!/bin/bash
WORDS=("0" "1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "11" "12" "13" "14" "15" "16" "17" "18" "19" "20" "30" "40" "50" "60" "70" "80" "90" "100" "200" "300" "400" "plus" "minus" "times" "divided_by" "equals" "point" "Here_is_your_math_harvest")

for w in "${WORDS[@]}"; do
    q=$(echo "$w" | sed 's/_/ /g')
    echo "Downloading: $q"
    curl -s "https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=en-gb&q=$q" -o "voice/$w.mp3"
    sleep 0.5
done
