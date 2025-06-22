// Ensure AudioContext is created after a user gesture (e.g., click)
let audioCtx;
let oscillators = {}; // To keep track of active oscillators

document.addEventListener("DOMContentLoaded", () => {
  const pianoKeysContainer = document.getElementById("piano-keys");
  const currentFrequencySpan = document.getElementById("current-frequency");
  const tuningOptionsContainer = document.querySelector(".tuning-options");
  const instrumentOptionsContainer = document.querySelector(
    ".instrument-options"
  ); // Get the container for instrument radio buttons

  // Define notes with their Western and new Greek names, and offsets from A4
  const notes = [
    { westernName: "C", greekName: "Νη", a4Offset: -9, isBlack: false },
    { westernName: "C#", greekName: "Νη#", a4Offset: -8, isBlack: true },
    { westernName: "D", greekName: "Πα", a4Offset: -7, isBlack: false },
    { westernName: "D#", greekName: "Πα#", a4Offset: -6, isBlack: true },
    { westernName: "E", greekName: "Βου", a4Offset: -5, isBlack: false },
    { westernName: "F", greekName: "Γα", a4Offset: -4, isBlack: false },
    { westernName: "F#", greekName: "Γα#", a4Offset: -3, isBlack: true },
    { westernName: "G", greekName: "Δι", a4Offset: -2, isBlack: false },
    { westernName: "G#", greekName: "Δι#", a4Offset: -1, isBlack: true },
    { westernName: "A", greekName: "Κε", a4Offset: 0, isBlack: false }, // A4
    { westernName: "A#", greekName: "Κε#", a4Offset: 1, isBlack: true },
    { westernName: "B", greekName: "Ζω", a4Offset: 2, isBlack: false },
  ];

  // --- Global Variables for Tuning and Instrument ---
  let baseA4Frequency; // Will be set by tuning selection
  let currentInstrumentType = "choir"; // Default instrument selected at start

  // Function to get the Greek name for a given Western note name, applying primes based on octave.
  const getGreekNoteName = (westernName, octave) => {
    const noteInfo = notes.find((n) => n.westernName === westernName);
    if (!noteInfo) return westernName;

    let greekName = noteInfo.greekName;
    let primeSuffix = "";

    if (octave === 3) {
      primeSuffix = "";
    } else if (octave === 4) {
      if (westernName === "B") {
        primeSuffix = "᾽";
      } else {
        primeSuffix = "";
      }
    } else if (octave >= 5) {
      primeSuffix = "᾽";
    }

    return greekName + primeSuffix;
  };

  // Function to generate piano keys based on the desired range
  const generatePianoKeys = (
    startNoteName,
    startOctave,
    endNoteName,
    endOctave
  ) => {
    pianoKeysContainer.innerHTML = ""; // Clear existing keys

    let startIndex = notes.findIndex(
      (note) => note.westernName === startNoteName
    );
    if (startIndex === -1) {
      console.error(`Starting note "${startNoteName}" not found.`);
      return;
    }

    let endIndex = notes.findIndex((note) => note.westernName === endNoteName);
    if (endIndex === -1) {
      console.error(`Ending note "${endNoteName}" not found.`);
      return;
    }

    const totalNotesCount =
      (endOctave - startOctave) * 12 + (endIndex - startIndex) + 1;

    let currentNoteInNotesArray = startIndex;
    let currentOctave = startOctave;

    for (let i = 0; i < totalNotesCount; i++) {
      const note = notes[currentNoteInNotesArray % 12];
      const noteIndexFromA4 = (currentOctave - 4) * 12 + note.a4Offset;
      const frequency = baseA4Frequency * Math.pow(2, noteIndexFromA4 / 12);

      const westernNoteNameWithOctave = `${note.westernName}${currentOctave}`;
      const displayNoteName = getGreekNoteName(note.westernName, currentOctave);

      const keyElement = document.createElement("div");
      keyElement.classList.add("key", note.isBlack ? "black-key" : "white-key");
      keyElement.dataset.frequency = frequency.toFixed(2);
      keyElement.dataset.note = westernNoteNameWithOctave;
      keyElement.textContent = displayNoteName;

      // Mouse events for desktop
      keyElement.addEventListener("mousedown", (event) => {
        event.preventDefault(); // Prevent default browser behavior (like text selection)
        playNote(keyElement, parseFloat(keyElement.dataset.frequency));
      });
      keyElement.addEventListener("mouseup", () => stopNote(keyElement));
      keyElement.addEventListener("mouseleave", () => stopNote(keyElement));

      // Touch events for mobile
      keyElement.addEventListener(
        "touchstart",
        (event) => {
          event.preventDefault(); // Prevent scrolling, zooming, etc. to allow piano interaction
          playNote(keyElement, parseFloat(keyElement.dataset.frequency));
        },
        { passive: false }
      ); // Use passive: false to allow preventDefault()

      keyElement.addEventListener("touchend", () => stopNote(keyElement));
      keyElement.addEventListener("touchcancel", () => stopNote(keyElement)); // Handle interrupted touches

      pianoKeysContainer.appendChild(keyElement);

      currentNoteInNotesArray++;
      if (currentNoteInNotesArray % 12 === 0 && i < totalNotesCount - 1) {
        currentOctave++;
      }
    }
  };

  // --- Tuning Logic ---
  function setBaseTuning(selectedOptionValue) {
    let newBaseA4Frequency = parseFloat(selectedOptionValue);
    baseA4Frequency = newBaseA4Frequency;
    currentFrequencySpan.textContent = baseA4Frequency.toFixed(3);
    stopAllNotes();
    generatePianoKeys("F", 3, "F", 5);
  }

  // --- Audio Context and Playback Functions ---
  document.body.addEventListener("mousedown", initializeAudioContext, {
    once: true,
  });
  document.body.addEventListener("keydown", initializeAudioContext, {
    once: true,
  });
  document.body.addEventListener("touchstart", initializeAudioContext, {
    once: true,
  });

  function initializeAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext initialized");
      audioCtx.resume().then(() => {
        console.log("AudioContext resumed successfully");
      });
    }
  }

  function playNote(keyElement, frequency) {
    if (!audioCtx) {
      console.warn(
        "AudioContext not initialized yet. Click on the page first."
      );
      return;
    }

    const note = keyElement.dataset.note;
    if (!oscillators[note]) {
      keyElement.classList.add("active");

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // Set initial gain to 0 to implement attack
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

      // --- Instrument specific sound generation ---
      switch (currentInstrumentType) {
        case "organ":
          oscillator.type = "square"; // Richer harmonics, good for organ
          gainNode.gain.linearRampToValueAtTime(
            0.5,
            audioCtx.currentTime + 0.02
          ); // Fast attack for organ
          break;
        case "flute":
          oscillator.type = "triangle"; // Softer, flute-like harmonics
          gainNode.gain.linearRampToValueAtTime(
            0.5,
            audioCtx.currentTime + 0.05
          ); // Quick attack for flute
          break;
        case "guitar":
          oscillator.type = "sawtooth"; // Sawtooth has rich harmonics, good for strings
          gainNode.gain.linearRampToValueAtTime(
            0.5,
            audioCtx.currentTime + 0.005
          ); // Very fast attack for plucked sound
          break;
        default: // Fallback to organ if something goes wrong
          oscillator.type = "square";
          gainNode.gain.linearRampToValueAtTime(
            0.5,
            audioCtx.currentTime + 0.2
          );
          break;
      }

      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime); // Start playing immediately
      oscillators[note] = { oscillator, gainNode };
    }
  }

  function stopNote(keyElement) {
    const note = keyElement.dataset.note;
    if (oscillators[note]) {
      keyElement.classList.remove("active");
      const { oscillator, gainNode } = oscillators[note];

      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      // Exponential ramp to 0.001 (near silence) over 0.1 seconds for a natural release
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.1
      );

      // Stop the oscillator after the release phase
      oscillator.stop(audioCtx.currentTime + 0.1);
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        delete oscillators[note];
      };
    }
  }

  function stopAllNotes() {
    if (audioCtx) {
      Object.values(oscillators).forEach(({ oscillator, gainNode }) => {
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioCtx.currentTime + 0.05
        );
        oscillator.stop(audioCtx.currentTime + 0.05);
      });
      oscillators = {};
      document
        .querySelectorAll(".key.active")
        .forEach((key) => key.classList.remove("active"));
    }
  }

  // --- Event Listeners and Initial Setup ---

  // Initial tuning setup (sets baseA4Frequency and generates keys)
  const initialCheckedTuningValue = document.querySelector(
    'input[name="tuning"]:checked'
  ).value;
  setBaseTuning(initialCheckedTuningValue);

  // Event listener for tuning options
  tuningOptionsContainer.addEventListener("change", (event) => {
    setBaseTuning(event.target.value);
  });

  // Event listener for instrument options
  instrumentOptionsContainer.addEventListener("change", (event) => {
    currentInstrumentType = event.target.value;
    stopAllNotes(); // Stop any currently playing notes when instrument changes
  });

  // Keyboard support (unchanged)
  const keyboardMap = {
    1: "F3",
    w: "F#3",
    s: "G3",
    e: "G#3",
    d: "A3",
    q: "A#3",
    a: "B3",
    s: "C4",
    e: "C#4",
    d: "D4",
    r: "D#4",
    f: "E4",
    g: "F4",
    z: "F#4",
    h: "G4",
    u: "G#4",
    j: "A4",
    i: "A#4",
    k: "B4",
    l: "C5",
    o: "C#5",
    2: "D5",
    p: "D#5",
    ";": "E5",
    "'": "F5",
  };

  document.addEventListener("keydown", (event) => {
    const noteName = keyboardMap[event.key.toLowerCase()];
    if (noteName && !event.repeat) {
      const keyElement = document.querySelector(
        `.key[data-note="${noteName}"]`
      );
      if (keyElement && !keyElement.classList.contains("active")) {
        playNote(keyElement, parseFloat(keyElement.dataset.frequency));
      }
    }
  });

  document.addEventListener("keyup", (event) => {
    const noteName = keyboardMap[event.key.toLowerCase()];
    if (noteName) {
      const keyElement = document.querySelector(
        `.key[data-note="${noteName}"]`
      );
      if (keyElement) {
        stopNote(keyElement);
      }
    }
  });
});
