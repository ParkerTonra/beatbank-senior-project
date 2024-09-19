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
   pnpm install
   ```

3. **Run the Development Server:**
   ```bash
   pnpm tauri dev
   ```
4. ***Optional*: Build for production (Windows only)**
   ```bash
   pnpm tauri build
   ```
   After the build process completes, an .exe file will be generated in the src-tauri/target/release directory of your project.
  


TODO/ideas
style cleanup + buttons
TODO:
- [] add songs to set with button
- [] edit set name
- [] make default column sizes look nice
- FF button
  ideas:
- Allow users to star sets to prioritize favs/ones being worked on.
- BeatSet page has multiple tabs / ways to look at the set


## 📝 Changelog
**Tauri:** Initialized a new tauri project with a splash screen & file input.
**tailwind:** added tailwind CSS
**diesel:** added diesel as a rust dependency for ORM
