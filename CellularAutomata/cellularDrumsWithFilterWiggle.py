# https://plato.stanford.edu/entries/cellular-automata/supplement.html
# https://cellpylib.org/
# Turn on "remote"

from scamp import *
import cellpylib as cpl
import numpy as np
import random
import math


s = Session(tempo=100)

drums = s.new_midi_part("drums", "IAC Bus 1", start_channel=1, num_channels=1)

# # For training the MIDI CC Control
# drums.send_midi_cc(16, 0)
# exit()

kick = np.array([[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]])
snare = np.array([[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]])
hihat = np.array([[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1]])


def wiggle_drum_filter():
    t = 0
    while True:
        drums.send_midi_cc(16, math.sin(t / 4) * 0.5 + 0.5)
        wait(0.05)
        t += 0.05
        
fork_unsynchronized(wiggle_drum_filter)


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