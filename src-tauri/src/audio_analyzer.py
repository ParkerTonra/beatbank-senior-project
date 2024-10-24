import os
import librosa
import sys
import numpy as np


def analyze(file_path):
    try:
        print(f"Starting analysis on {file_path}")
        y, sr = librosa.load(file_path)
        print(f"Loaded audio signal with shape: {y.shape} and sample rate: {sr}")

        # calculate tempo
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        #round the tempo to two decimal places
        # 
        #
        
        print(f"Estimated Tempo: {tempo} BPM")

        # compute chroma (musical note) features using constant-Q transform
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

        # aggregate chroma features over time by taking the mean
        chroma_mean = np.mean(chroma, axis=1)

        # normalize the chroma vector
        chroma_norm = chroma_mean / np.linalg.norm(chroma_mean)

        # define the Krumhansl-Schmuckler key profiles
        # major
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                                  2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        # minor
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                                  2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

        # Normalize the key profiles
        major_profile = major_profile / np.linalg.norm(major_profile)
        minor_profile = minor_profile / np.linalg.norm(minor_profile)

        # Initialize arrays to hold correlation scores
        correlation_major = []
        correlation_minor = []

        # Compute correlation with each major and minor key profile
        for i in range(12):
            # Rotate the profiles to align with each key
            major_profile_rotated = np.roll(major_profile, i)
            minor_profile_rotated = np.roll(minor_profile, i)

            # Compute the correlation (dot product) between the chroma vector and the key profiles
            corr_major = np.dot(chroma_norm, major_profile_rotated)
            corr_minor = np.dot(chroma_norm, minor_profile_rotated)

            correlation_major.append(corr_major)
            correlation_minor.append(corr_minor)

        # Determine the best matching key
        max_major = np.argmax(correlation_major)
        max_minor = np.argmax(correlation_minor)

        if correlation_major[max_major] > correlation_minor[max_minor]:
            key_index = max_major
            mode = 'Major'
            confidence = correlation_major[max_major]
        else:
            key_index = max_minor
            mode = 'Minor'
            confidence = correlation_minor[max_minor]

        # Map the key index to the corresponding key name
        key_names = ['C', 'C#', 'D', 'D#', 'E', 'F',
                     'F#', 'G', 'G#', 'A', 'A#', 'B']
        key = f"{key_names[key_index]} {mode}"
        print(f"Detected Key: {key} with confidence {confidence}")
        
        tempo = float(tempo)
        tempo = round(tempo, 2)

        return key, tempo
    except Exception as e:
        print(f"Failed to analyze audio: {e}")
        print("This error is from the audio_analyzer.py script")