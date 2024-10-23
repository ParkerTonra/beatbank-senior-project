import librosa
import os
import numba
import numpy


print("Librosa is installed at:", os.path.dirname(librosa.__file__))

print("Numpy version:")
print(numpy.__version__)
print("Numpy is installed at:", os.path.dirname(numpy.__file__))
print ("Numba version")
print(numba.__version__)
print("Numba is installed at:", os.path.dirname(numba.__file__))
