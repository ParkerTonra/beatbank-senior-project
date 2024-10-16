import os
import librosa
import sys
import numpy


def analyze(file_path):
    try:

        print("Python executable:", sys.executable)
        print("Python path:", sys.path)
        print(f"Numpy version: {numpy.__version__}")
        print("Numpy is installed at:", os.path.dirname(numpy.__file__))


        print(f"Starting analysis on {file_path}")
        y, sr = librosa.load(file_path)
        print("Finished loading audio file")
        print(f"loaded into y: {y}/n and sr: {sr}")
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        print(f"Tempo: {tempo}")
        key = librosa.core.hz_to_note(librosa.core.midi_to_hz(librosa.feature.chroma_stft(y=y, sr=sr).argmax(axis=0).mean()))
        print(f"Key: {key}")
        return key, tempo
    except Exception as e:
        print(f"Failed to analyze audio: {e}")
        print(f"This text is coming from audio_analyzer.py")

print (sys.path)