"""Neural narration with edge-tts: writes the mp3 and prints the time of every word as JSON.

usage: tts.py VOICE RATE OUT.mp3 TEXT  ->  [[start_seconds, duration_seconds, "word"], ...]
"""
import asyncio
import json
import sys

import edge_tts


async def main(voice, rate, out, text):
    words = []
    tts = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    with open(out, "wb") as f:
        async for chunk in tts.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append([chunk["offset"] / 1e7, chunk["duration"] / 1e7, chunk["text"]])
    print(json.dumps(words))


asyncio.run(main(*sys.argv[1:5]))
