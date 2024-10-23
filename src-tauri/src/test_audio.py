from audio_analyzer import analyze

# List of file paths
file_paths = [
    r"E:\DDownloads\downloads-old\86 Dreaddy Bear - Denver.wav",
    r"E:\DDownloads\downloads-old\dread & imagine r7 2.wav",
    r"E:\DDownloads\downloads-old\Dreaddy Bear - Axel F'D UP.wav",
    r"E:\Audio\Music\02 - Bou, B Live - Nan Slapper-MKD.wav",
    r"E:\Audio\Music\04-cesco_and_hamdi-swing_king.mp3",
    r"E:\Audio\Music\complete\Sir Hambone\Jade Cicada - Pressure Gamut (2023) [FLAC - 24Bit - 44.1kHz]\04 - Jade Cicada - Chonkra.flac",
    r"E:\Audio\Music\02 - Bou, B Live - Nan Slapper-MKD.wav",
    r"E:\Audio\Music\01-o.b.f_x_charlie_p-trees_(monty_remix)-rpo.mp3",
    r"E:\Audio\Music\complete\Sir Hambone\Jade Cicada - Pressure Gamut (2023) [FLAC - 24Bit - 44.1kHz]\04 - Jade Cicada - Chonkra.wav",
    r"E:\DDownloads\downloads-old\Dreaddy Bear - Junkyard Titan (Original Mix).wav",
    r"E:\DDownloads\downloads-old\Arugula 2022 0624 1350.wav",
    r"E:\DDownloads\downloads-old\Tipper - Off Kilter (VIP Mix).mp3",
    r"E:\Splice\mr bill e27 Project\Samples\splice\Kloudmen - Shifter VIP.aiff",
    r"E:\Audio\Music\seppa\yesyesyes\seppa - yesyesyes - 01 yesyesyesyesyesyesye.aiff",
    r"E:\Audio\Music\Bakey, Capo Lee - AM TO PM (Original Mix).mp3",
    r"C:\Users\parke\Downloads\Dreaddy Bear Ergot (twenty-five) (VIP).wav",
    r"E:\DDownloads\downloads-old\Dreaddy Bear - Axel F'D UP.wav"
]

# Iterate over each file path, analyze and print results
for file_path in file_paths:
    try:
        key, tempo = analyze(file_path)
        print(f"File: {file_path}")
        print(f"Key: {key}, Tempo: {tempo}\n")
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}\n")
