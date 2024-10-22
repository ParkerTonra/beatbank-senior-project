import sys
import os

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
analyzer_path = os.path.join(script_dir, "audio_analyzer.py")

# Set the path to where the audio_analyzer.py file is located
sys.path.append(analyzer_path)

try:
    import audio_analyzer
    print("Module imported successfully!")
except ModuleNotFoundError as e:
    print(f"Failed to import module: {e}")
