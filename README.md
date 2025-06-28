# Byzantine Note Piano

## Overview

The Byzantine Note Piano is an interactive web-based musical instrument designed to explore and play notes within Byzantine musical scales and tunings. It provides a unique blend of traditional musical concepts with modern web technology, allowing users to select different base tunings and instrument timbres.

## Features

- **Byzantine Note Display:** Keys are labeled with their corresponding Greek note names.
- **Adjustable Base Tuning:** Users can select between different standard A4 base frequencies (e.g., 349.338 Hz, 392 Hz, 440 Hz) to set the overall pitch.
- **Multiple Instrument Timbres:** Choose from four distinct synthesized sounds:
  - **Church Organ:** A richer square wave with a fast attack, mimicking an organ.
  - **Ney / Flute:** A softer triangle wave with a quick attack, reminiscent of wind instruments.
  - **Guitar:** A softer swatooth wave with a very quick attack, reminiscent of string instruments.
- **Interactive Piano Keys:** Play notes by clicking or tapping on the piano keys directly on the screen.
- **Keyboard Support:** Play notes using your computer's QWERTY keyboard (specific key mappings are defined in `script.js`).
- **Responsive Design:** The interface adapts gracefully to different screen sizes, providing an optimal experience on both desktop and mobile devices.
  - Controls (Tuning and Instrument selection) stack vertically on smaller screens.
  - Piano keys adjust size and allow for horizontal scrolling on mobile.
- **Web Audio API:** Utilizes the browser's native audio capabilities for real-time sound synthesis.

## How to Use

### Local Setup

1.  **Clone the repository** (if hosted on a platform like GitHub) or simply download all project files to your local machine.

    ```bash
    git clone git@github.com:RolanWebT/byzantine-piano.git
    ```

2.  **Navigate to the project directory** in your terminal or file explorer.
3.  **Open `index.html`:** Double-click the `index.html` file in your web browser. This project runs entirely client-side, so you do not need a local web server.

### Playing Music

- **Click/Tap:** Use your mouse or touch screen to press the individual piano keys.
- **Keyboard:** Press the corresponding keys on your computer keyboard. The default mapping includes keys in the 'QWERTY' row and below.
- **Select Tuning:** Use the radio buttons in the "Select Base Tuning" section to change the fundamental 'A4' frequency.
- **Select Instrument:** Use the radio buttons in the "Select Instrument" section to switch between the different available sounds.

## Technologies Used

- **HTML5:** For the structural markup of the web application.
- **CSS3:** For styling the user interface, layout (Flexbox), and ensuring responsiveness across devices (Media Queries).
- **JavaScript (ES6+):** For all interactive logic, dynamic key generation, and control handling.
- **Web Audio API:** The core technology for generating and manipulating audio in the browser.

## Future Enhancements (Ideas)

- More realistic instrument sounds using loaded audio samples (e.g., actual Byzantine choir samples).
- Integration of more complex Byzantine scale modes.
- Ability to record and playback melodies.
- Visual feedback for notes being played.

## Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature X'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is open-sourced under the [MIT License](LICENSE).

## Credits

Developed by Rolan Tayarah
Inspired by the rich musical heritage of Byzantium.
