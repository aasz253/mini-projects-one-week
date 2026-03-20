# Local Music Player

A feature-rich, privacy-focused music player application built as a Progressive Web App (PWA) using HTML, CSS, and JavaScript. Works completely offline and plays music directly from your device's storage.

## Features

### Core Playback
- **Full Audio Controls**: Play, pause, next, previous, seek
- **Shuffle & Repeat**: Shuffle mode and repeat (off, one, all)
- **Volume Control**: Adjustable volume with mute toggle
- **Background Playback**: Continues playing when app is in background
- **Lock Screen Controls**: Control playback from lock screen (where supported)
- **Notification Controls**: Media notifications (where supported)

### Library Management
- **Folder-based Organization**: Browse music by folder structure
- **Multiple Views**: Home, Folders, Playlists, Settings
- **Search**: Search songs, artists, and albums
- **Recently Played**: Quick access to recently played tracks
- **Most Played**: See your most played songs
- **Favorites**: Mark and manage favorite songs

### Playlists
- **Create Playlists**: Create custom playlists
- **Manage Songs**: Add/remove songs from playlists
- **Export/Import**: Export playlists as JSON
- **Duplicate**: Copy existing playlists

### Audio Features
- **Equalizer**: 5-band equalizer with presets
  - Presets: Flat, Bass Boost, Treble Boost, Vocal, Rock, Pop, Jazz, Classical, Electronic
- **Sleep Timer**: Auto-stop playback after set time
  - Options: 15, 30, 45, 60, 90, 120 minutes

### User Interface
- **Material Design 3**: Clean, modern Material You-inspired design
- **Dark/Light Theme**: System default, dark, or light modes
- **Responsive**: Works on phones and tablets
- **Touch Friendly**: All tap targets are 48px or larger
- **Smooth Animations**: Transitions and micro-interactions

### Technical
- **Works Offline**: Full functionality without internet
- **PWA**: Install as app on home screen
- **IndexedDB Storage**: Persistent storage for library and preferences
- **No Data Collection**: Privacy-focused, no tracking

## Supported Audio Formats

- MP3
- M4A (AAC)
- FLAC
- WAV
- OGG
- AAC
- WMA
- AIFF
- OPUS

## Installation

### Web (PWA)
1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari)
2. Or serve with any local web server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```
3. Add to home screen (PWA install prompt or browser menu)

### Android (Capacitor)
To build as an Android APK:

1. Install Node.js
2. Create Capacitor project:
   ```bash
   npx @capacitor/cli init MusicPlayer com.musicplayer.app --web-dir=.
   npx @capacitor/cli add android
   npx cap add android
   ```

3. Copy web assets:
   ```bash
   npx cap copy android
   ```

4. Open in Android Studio:
   ```bash
   npx cap open android
   ```

5. Build APK in Android Studio

## Project Structure

```
music-app/
├── index.html              # Main entry point
├── manifest.json            # PWA manifest
├── service-worker.js        # Offline support
├── css/
│   ├── themes.css           # Theme variables (dark/light)
│   ├── style.css            # Main styles
│   └── player.css           # Player UI styles
├── js/
│   ├── utils.js             # Utility functions
│   ├── fileScanner.js       # Music library scanning
│   ├── playlistManager.js   # Playlist operations
│   ├── player.js            # Audio playback engine
│   └── app.js               # Main application
├── assets/
│   ├── icons/               # App icons (PNG)
│   └── default-album-art.png
└── README.md
```

## Browser Compatibility

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- Samsung Internet 14+

### Required APIs
- IndexedDB
- File System Access API
- MediaSession API
- Web Audio API
- Service Workers

Note: Some features require a secure context (HTTPS) or specific browser permissions.

## How to Use

1. **Add Music**
   - Click the folder icon in navigation
   - Tap "Select Folders" in Settings
   - Choose folders containing your music files

2. **Play Music**
   - Browse songs from Home or Folders
   - Tap any song to play
   - Use bottom controls for playback

3. **Create Playlist**
   - Go to Playlists tab
   - Click "Create Playlist"
   - Add songs from your library

4. **Search**
   - Tap the search icon in header
   - Type song name, artist, or album

5. **Customize**
   - Go to Settings
   - Choose theme
   - Adjust crossfade
   - Set up equalizer

## Known Limitations

- File System Access API requires user permission each session
- Some browsers don't support all audio formats
- Metadata extraction limited for some formats
- Album art must be embedded in audio file

## Performance Tips

- For large libraries (10,000+ songs), initial scan may take time
- Use folders to organize large collections
- Clear browser cache periodically for best performance

## Privacy

This app:
- Does NOT collect any user data
- Does NOT send data to any server
- Stores all data locally on device
- Works completely offline

## License

MIT License - Free for personal and commercial use

## Credits

Built with vanilla JavaScript, HTML5, and CSS3.
Uses Web Audio API for audio visualization.
