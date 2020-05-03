from scipy.fftpack import fft
from scipy.io import wavfile # get the api
fs, data = wavfile.read('songg.wav') # load the data
import numpy as np;
window = np.hamming(51)


A = fft(window, 2048) / 25.5
mag = np.abs(fftshift(A))
freq = np.linspace(-0.5, 0.5, len(A))
response = 20 * np.log10(mag)
response = np.clip(response, -100, 100)
import matplotlib as plt;
plt.plot(window)

plt.figure()


plt.plot(freq, response)
