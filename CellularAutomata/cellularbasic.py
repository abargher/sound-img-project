# https://plato.stanford.edu/entries/cellular-automata/supplement.html
# https://cellpylib.org/

import cellpylib as cpl
import numpy as np

cellular_automata = np.array([[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]])
cpl.plot(cellular_automata)

for _ in range(10):
    cellular_automata = cpl.evolve(cellular_automata, timesteps=2,
                                   apply_rule=lambda n, c, t: cpl.nks_rule(n, 30))
    cpl.plot(cellular_automata)

    