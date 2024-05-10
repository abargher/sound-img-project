from scamp import *
import cellpylib as cpl
import numpy as np
import random

s = Session(tempo=100)

drums = s.new_midi_part("drums", "IAC Bus 1", start_channel=1, num_channels=1)

kick = np.array([[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]])
snare = np.array([[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]])
hihat = np.array([[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1]])


while True:
    for k, s, h in zip(kick[-1], snare[-1], hihat[-1]):
        if k:
            drums.play_note(36, 0.8, 0.25, blocking=False)
        if s:
            drums.play_note(38, 0.8, 0.25, blocking=False)
        if h:
            drums.play_note(42 if random.random() < 0.8 else 46, 0.8, 0.25, blocking=False)
        wait(0.25)
        
    kick = cpl.evolve(kick, timesteps=2, apply_rule=lambda n, c, t: cpl.nks_rule(n, 30))
    snare = cpl.evolve(snare, timesteps=2, apply_rule=lambda n, c, t: cpl.nks_rule(n, 146))
    if sum(snare[-1]) == 0:
        snare = np.array([[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]])
    hihat = cpl.evolve(hihat, timesteps=2, apply_rule=lambda n, c, t: cpl.nks_rule(n, 135))