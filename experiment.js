// import * as nn from "https://cdn.jsdelivr.net/gh/netizenorg/netnet-standard-library/build/nn.min.js";
// import * as Tone from "https://tonejs.github.io/build/Tone.js";
/* global nn, Tone */

function printf (out) {
  if (enableDebug) {
    console.log(out)
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function array_avg(arr, start, end) {
  let total = 0;
  for (let i = start; i < end; i++) {
    total += arr[i];
  }
  return total;
}

function toggleControlDisplay() {
  const visible = nn.get("#control-page").style.visibility;
  if (visible == 'hidden') {
    nn.get('#control-page').style.visibility = 'visible';
    // document.getElementsByClassName("button").style.visibility = 'visible';
  } else {
    nn.get('#control-page').style.visibility = 'hidden';
    // document.getElementsByClassName("button").style.visibility = 'hidden';
  }
}

/* Global constants */
const defaultTempo = 90;
const defaultNoteCount = 16;
const defaultVolume = 0.5;  // expressed as a gain value
const defaultArpegg = 0.1;
let scale_pattern = [2,2,3,2,3]  // Pentatonic scale degrees

/* Global variables */
let baseVolume = defaultVolume;
const enableDebug = true;
let sandbox = null;

const effectState = {
  tempo : defaultTempo,
  reverb : 0,
  volume : defaultVolume,
  pitch : 0,
  scale : createScale("keyC", scale_pattern),
  arpegg : defaultArpegg,
};

const keySets = [
  { up    : "keyC",
    right : "keyA",
    down  : "keyGb",
    left  : "keyEb"
  },
  { up    : "keyG",
    right : "keyE",
    down  : "keyDb",
    left  : "keyBb"
  },
  { up    : "keyD",
    right : "keyB",
    down  : "keyAb",
    left  : "keyF"
  }
]

let currKeySet = keySets[0];

/* Initialize effect(s) */

const gain = new Tone.Gain(0.5).toDestination();

const pitchShift = new Tone.PitchShift({
  wet: 1,
  pitch: 0
});

const distort = new Tone.Distortion(0.0);
const pingPong = new Tone.PingPongDelay("8n", 0.2);

const synth = new Tone.PolySynth().chain(pitchShift, distort, pingPong, gain)
printf(synth.options.envelope)

// volume meter
const meter = new Tone.Meter(0.25);
meter.normalRange = true;
gain.connect(meter);
let meter_value = Math.max(-1000, meter.getValue());

// FFT analyzer
const fft = new Tone.FFT(1024);
fft.normalRange = true;
gain.connect(fft);

const defaultAttack = synth.options.envelope.attack;
const defaultRelease = synth.options.envelope.release;
const defaultDecay = synth.options.envelope.decay;

const listener = new GamepadListener();
listener.start();

listener.on('gamepad:connected', event => {
  const {
    index, // Gamepad index: Number [0-3].
    gamepad, // Native Gamepad object.
  } = event.detail;
  console.log(index, gamepad)
  Tone.start();
});

let controllerMap = {
  buttons: [
    {index:  0, pressed: false, value: 0},
    {index:  1, pressed: false, value: 0},
    {index:  2, pressed: false, value: 0},
    {index:  3, pressed: false, value: 0},
    {index:  4, pressed: false, value: 0},
    {index:  5, pressed: false, value: 0},
    {index:  6, pressed: false, value: 0},
    {index:  7, pressed: false, value: 0},
    {index:  8, pressed: false, value: 0},
    {index:  9, pressed: false, value: 0},
    {index: 10, pressed: false, value: 0},
    {index: 11, pressed: false, value: 0},
    {index: 12, pressed: false, value: 0},
    {index: 13, pressed: false, value: 0},
    {index: 14, pressed: false, value: 0},
    {index: 15, pressed: false, value: 0},
    {index: 16, pressed: false, value: 0},
    {index: 17, pressed: false, value: 0},
    {index: 18, pressed: false, value: 0}
  ],
  axes: [
    {value: 0},
    {value: 0},
    {value: 0},
    {value: 0}
  ]
}

/*
  Axes:
    0: LHoriz
    1: LVert
    2: RHoriz
    3: RVert
*/

listener.on('gamepad:0:axis:0', event => {
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  var old_val = controllerMap.axes[axis].value;
  var new_val = 0.85 * (old_val) + 0.15 * value;
  controllerMap.axes[axis].value = new_val;
  sandbox.setUniform("left_axis_x", new_val);
  printf(`axis ${axis} value = ${value}`)
  // change distortion
  distort.distortion = Math.abs(value/8)
});

listener.on('gamepad:0:axis:1', event => {
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  // var old_val = controllerMap.axes[axis].value;
  // var new_val = 0.85 * (old_val) + 0.15 * value;
  // var new_val2 = 0.8 * new_val + 0.2 * value;
  sandbox.setUniform("left_axis_y", value);
  controllerMap.axes[axis].value = value;

  printf(`axis ${axis} value = ${value}`)
  pitchShift.pitch = nn.map(value, 1, -1, -3, 3)
});

listener.on('gamepad:0:axis:2', event => {
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  printf(`axis ${axis} value = ${value}`)
  var old_val = controllerMap.axes[axis].value;
  var new_val = 0.85 * (old_val) + 0.15 * value;
  var new_val2 = 0.8 * new_val + 0.2 * value;
  sandbox.setUniform("right_axis_x", new_val2);
  controllerMap.axes[axis].value = new_val2;
  pingPong.wet.value = nn.map(Math.abs(value), 0, 1, 0, 0.5)
});

// Left stick click
listener.on('gamepad:0:button:10', event => {
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.axes[0].value = 0;
  controllerMap.axes[1].value = 0;
});

// Right stick click
listener.on('gamepad:0:button:11', event => {
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.axes[2].value = 0;
  controllerMap.axes[3].value = 0;
});

listener.on('gamepad:0:axis:3', event => {
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  var old_val = controllerMap.axes[axis].value;
  var new_val = 0.85 * (old_val) + 0.15 * value;
  var new_val2 = 0.8 * new_val + 0.2 * value;
  sandbox.setUniform("right_axis_y", new_val2);
  controllerMap.axes[axis].value = new_val2;

  printf(`axis ${axis} value = ${value}`)
  printf(`base volume is ${baseVolume}`)

  gain.gain.value = baseVolume + nn.map(value, 1, -1, -0.8, 0.8)
});

// Left trigger -- tempo down
listener.on('gamepad:0:button:6', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  const old_val = controllerMap.buttons[button].value;
  const new_val = 0.30 * old_val + 0.70 * value;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = new_val
  sandbox.setUniform("lt", new_val);

  if (pressed) {
    Tone.Transport.bpm.value = effectState.tempo - nn.map(value, 0, 1, 0, 30)
  } else {
    Tone.Transport.bpm.value = effectState.tempo
  }
});

// Right trigger -- tempo up
listener.on('gamepad:0:button:7', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  const old_val = controllerMap.buttons[button].value;
  const new_val = 0.30 * old_val + 0.70 * value;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = new_val
  sandbox.setUniform("rt", new_val);

  if (pressed) {
    Tone.Transport.bpm.value = effectState.tempo + nn.map(value, 0, 1, 0, 30)
  } else {
    Tone.Transport.bpm.value = effectState.tempo
  }
});

// dpad Up, increase octave
listener.on('gamepad:0:button:12', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    let currOctave = Number (nn.get("#octaves").value.slice(-1))
    let newOctave_num = (Math.min(6, currOctave + 1));
    let newOctave = "octave" + newOctave_num;
    nn.get("#octaves").value = newOctave
    sandbox.setUniform("octave", newOctave_num);
  }
});

// dpad Down, decrease octave
listener.on('gamepad:0:button:13', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    let currOctave = Number (nn.get("#octaves").value.slice(-1))
    let newOctave_num = (Math.max(1, currOctave - 1));
    let newOctave = "octave" + newOctave_num;
    nn.get("#octaves").value = newOctave
    sandbox.setUniform("octave", newOctave_num);
  }
});

// dpad Left, cycle key set left
listener.on('gamepad:0:button:14', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    let currSet = Number (nn.get("#keySets").value.slice(-1));
    let newSet = mod((currSet - 1), 3)
    printf(`old set: ${currSet} new set: ${newSet}`)
    nn.get("#keySets").value = "keySet" + newSet
    currKeySet = keySets[newSet]
  }
});

// dpad Right, cycle key set right
listener.on('gamepad:0:button:15', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    let currSet = Number (nn.get("#keySets").value.slice(-1));
    let newSet = mod((currSet + 1), 3)
    printf(`old set: ${currSet} new set: ${newSet}`)
    nn.get("#keySets").value = "keySet" + newSet
    currKeySet = keySets[newSet]
  }
});

function updateKey() {
  let newKey = nn.get("#keys").value;
  effectState.scale = createScale(newKey, scale_pattern)
  printf(`Now the key is ${newKey}`);
}

listener.on('gamepad:0:button:0', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    nn.get("#keys").value = currKeySet.down
    updateKey();
  }
});

listener.on('gamepad:0:button:1', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    nn.get("#keys").value = currKeySet.right
    updateKey();
  }
});


listener.on('gamepad:0:button:2', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    nn.get("#keys").value = currKeySet.left
    updateKey();
  }
});


// Left and Right bumper show/hide screen controls
listener.on('gamepad:0:button:4', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  if (pressed) {
    toggleControlDisplay();
  }
});
listener.on('gamepad:0:button:5', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  if (pressed) {
    toggleControlDisplay();
  }

});

function randomizeMelody() {
  randomizeSequence(nn.get("#noteCount").value, nn.get("#arpegg").value);
}

// Select = randomize melody
listener.on('gamepad:0:button:8', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  if (pressed) {
    randomizeMelody();
  }
});

// Start = play/pause
listener.on('gamepad:0:button:9', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value

  if (pressed) {
    toggleScale();
    let currPlay = nn.get("#play-pause").checked
    nn.get("#play-pause").checked = !currPlay
  }
});

function startPolling () {
  listener.start()
}
function stopPolling () {
  listener.stop();
}


/* Event listeners */
let root = nn.get("#keys").value
generateMelody(nn.get("#noteCount").value, nn.get("#arpegg").value)

nn.get("#randomize").on("click", randomizeMelody);

nn.get("#play-pause").on("input", () => {
  toggleScale();
  Tone.start();
  sandbox.setUniform("bg_color",1,0.5,0,1.0);
})


// tempo controls
nn.get("#tempo").on("input", () => {
  let newTempo = Number(nn.get("#tempo").value);
  Tone.Transport.bpm.value = newTempo
  effectState.tempo = newTempo
  printf(`tempo changed to ${newTempo}`)})

nn.get("#tempoReset").on("click", () => {
  nn.get("#tempo").value = defaultTempo;
  Tone.Transport.bpm.value = defaultTempo;
  printf(`tempo reset to default value (${defaultTempo} bpm)`);
})

// volume controls
nn.get("#volume").on("input", () => {
  let newVolume = Number(nn.get("#volume").value);
  baseVolume = newVolume;
  gain.gain.value = baseVolume;
  printf(`volume set to ${newVolume}`);
})

nn.get("#volumeReset").on("click", () => {
  gain.gain.value = defaultVolume
  nn.get("#volume").value = defaultVolume
  printf("volume reset to default")
})

// melody length controls
nn.get("#noteCountReset").on("click", () => {
  nn.get("#noteCount").value = defaultNoteCount;
  printf("melody length reset to default (16)");
})

nn.get("#arpeggReset").on("click", () => {
  nn.get("#arpegg").value = defaultArpegg;
  printf(`arpeggio percentage reset to default (${defaultArpegg})`);
})

// key select controls
nn.get("#keys").on("input", () => {
  let newKey = nn.get("#keys").value;
  effectState.scale = createScale(newKey, scale_pattern)
  printf(`Now the key is ${newKey}`);
})

nn.get("#toggleHelp").on("click", () => {
  let visible = nn.get("#instructions").style.display
  if (visible == 'none') {
    nn.get("#toggleHelp").textContent = "hide controls help";
    nn.get("#instructions").style.display = 'block'
    // nn.get("#title").style.visibility = 'visible'
    // nn.get("#instructions").style.visibility = 'visible'
    // nn.get("#instructions").style.visibility = 'visible'
  } else {
    nn.get("#toggleHelp").textContent = "show controls help";
    nn.get("#instructions").style.display = 'none'
    // nn.get("#instructions").style.visibility = 'hidden'
    // nn.get("#instructions").style.visibility = 'hidden'
  }

})

nn.get("#keySets").on("input", updateKey)

window.onload = () => {
  sandbox = window.glslCanvases[0]
  console.log(sandbox);

  // set canvas size
  nn.get("#shadercanvas").width = document.body.clientWidth;
  nn.get("#shadercanvas").height = document.body.clientHeight;

  setInterval(() => {
    // volume meter refresh
    const val = meter.getValue();
    const old_value = meter_value;
    const new_value = 0.87 * old_value + 0.13 * val;
    meter_value = new_value;
    sandbox.setUniform("note_pulse", new_value);
    // printf("note_pulse value: " + new_value)

    // FFT analysis
    const freqs = fft.getValue();
    // printf(freqs);


  }, 1);
};

document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    toggleControlDisplay();
  }
});

Tone.Transport.bpm.value = defaultTempo
function play_note_cb(time) {
  let scale_deg = play(time, synth, effectState.scale);
  sandbox.setUniform("scale_degree", scale_deg);
}

Tone.Transport.scheduleRepeat(time => play_note_cb(time), '16n')
