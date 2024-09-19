# 🎵 beatbank 
### Powered by Tauri, React, & TypeScript 

Beatbank is an open-source organizational tool for managing and analyzing audio files. Whether you're a musician or a producer, Beatbank helps you keep your beats organized and accessible, even outside of Rekordbox or a DAW. Plus, it doubles as a cross-platform desktop audio player.

## ✨ Features

- **🎛️ Table View for Beats**
  - Display all your audio files in a clean, sortable table.

- **📁 Organize Beats into Sets**
  - Plan your upcoming gigs by organizing your beats into custom sets.

- **🎶 Audio Playback**
  - Supports playback for `.wav`, `.mp3`, and `.flac` files.
  - *Note: Audio seek is currently unsupported for `.flac` files.*

- **💾 Persistent State**
  - All your data is saved across sessions via SQLite, so you never lose your progress.

---

Beatbank is designed to make managing your audio files simple and efficient, all in a beautiful and intuitive interface. Ready to streamline your audio workflow? Give Beatbank a try!

## 🛠️ Building Beatbank

To get started with Beatbank, follow these steps to build the app:

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v16 or later recommended)
- **Rust** (latest stable version)
- **Tauri CLI**: You can install it via Cargo:
  ```bash
  cargo install tauri-cli

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/parkertonra/beatbank.git
   cd beatbank

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run tauri dev
   ```
4. ***Optional*: Build for production (Windows only)**
   ```bash
   npm run tauri build
   ```
   After the build process completes, an .exe file will be generated in the src-tauri/target/release directory of your project.

# 🤝 Contributing
This is currently a solo project, but I welcome contributions! If you encounter a bug, have a feature request, or want to improve Beatbank, feel free to open an issue or submit a pull request.

# 📝 License
Beatbank is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

TODO
style cleanup + buttons
TODO:
 - [] Add to set - make the songs display in a table
 - [] edit set name from set card with pencil button
 - [] make default column sizes look nice
- FF button
ideas:
- Allow users to star sets to prioritize favs/ones being worked on.
- BeatSet page has multiple tabs / ways to look at the set
- Custom context menu to interact with files