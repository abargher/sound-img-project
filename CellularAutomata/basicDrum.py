from scamp import *

s = Session(tempo=100)

drums = s.new_midi_part("drums", "IAC Bus 1", start_channel=1, num_channels=1)

for pitch in range(38, 54):
    drums.play_note(pitch, 1, 1)
    