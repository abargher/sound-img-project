from scamp import *
import cellpylib as cpl
import numpy as np

s = Session(tempo=100)

drums = s.new_midi_part("drums", "IAC Bus 1", start_channel=1, num_channels=1)

snare_cells = np.array([[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]])

while True:
    for cell in snare_cells[-1]:
        if cell:
            drums.play_note(38, 0.8, 0.25)
        else:
            wait(0.25)
    snare_cells = cpl.evolve(snare_cells, timesteps=2,
                             apply_rule=lambda n, c, t: cpl.nks_rule(n, 30))