const Utils = {
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    formatDuration(ms) {
        return this.formatTime(ms / 1000);
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    },

    getFileNameWithoutExtension(filename) {
        return filename.substring(0, filename.lastIndexOf('.')) || filename;
    },

    isAudioFile(filename) {
        const ext = this.getFileExtension(filename);
        return ['mp3', 'm4a', 'flac', 'wav', 'ogg', 'aac', 'wma', 'aiff', 'opus'].includes(ext);
    },

    getDefaultAlbumArt() {
        return 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <rect fill="#282828" width="200" height="200"/>
                <circle cx="100" cy="100" r="60" fill="#333"/>
                <circle cx="100" cy="100" r="20" fill="#555"/>
                <circle cx="100" cy="100" r="8" fill="#777"/>
            </svg>
        `);
    },

    localStorage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Error writing to localStorage:', e);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removing from localStorage:', e);
                return false;
            }
        }
    },

    showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), duration);
        }
    }
};

const MusicPlayer = {
    audio: null,
    currentSong: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    isShuffled: false,
    repeatMode: 0,
    volume: 1,
    shuffleQueue: [],
    analyser: null,
    audioContext: null,
    sourceNode: null,
    gainNode: null,
    eqFilters: [],
    sleepTimer: null,
    sleepTimerEnd: null,

    init() {
        this.audio = new Audio();
        this.audio.preload = 'metadata';
        this.setupEventListeners();
        this.setupMediaSession();
        this.loadSettings();
        this.initAudioContext();
    },

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
            this.gainNode = this.audioContext.createGain();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.sourceNode.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            this.initEQFilters();
        } catch (e) {
            console.log('AudioContext not supported');
        }
    },

    initEQFilters() {
        if (!this.audioContext) return;
        const frequencies = [60, 230, 910, 3600, 14000];
        this.eqFilters = frequencies.map(freq => {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });
        this.gainNode.disconnect();
        this.sourceNode.connect(this.eqFilters[0]);
        for (let i = 0; i < this.eqFilters.length - 1; i++) {
            this.eqFilters[i].connect(this.eqFilters[i + 1]);
        }
        this.eqFilters[this.eqFilters.length - 1].connect(this.gainNode);
        this.gainNode.connect(this.analyser);
    },

    setupEventListeners() {
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onError(e));
        this.audio.addEventListener('canplay', () => this.onCanPlay());
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    },

    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => this.play());
            navigator.mediaSession.setActionHandler('pause', () => this.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                this.seek(details.seekTime);
            });
        }
    },

    updateMediaSession() {
        if ('mediaSession' in navigator && this.currentSong) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: this.currentSong.title,
                artist: this.currentSong.artist,
                album: this.currentSong.album,
                artwork: [{ src: this.currentSong.albumArt, sizes: '512x512', type: 'image/png' }]
            });
        }
    },

    loadSettings() {
        this.volume = Utils.localStorage.get('volume', 1);
        this.isShuffled = Utils.localStorage.get('shuffle', false);
        this.repeatMode = Utils.localStorage.get('repeatMode', 0);
        if (this.audio) {
            this.audio.volume = this.volume;
        }
    },

    saveSettings() {
        Utils.localStorage.set('volume', this.volume);
        Utils.localStorage.set('shuffle', this.isShuffled);
        Utils.localStorage.set('repeatMode', this.repeatMode);
    },

    async loadSong(song) {
        if (!song) return;
        this.currentSong = song;
        try {
            if (song.fileUrl) {
                this.audio.src = song.fileUrl;
            } else if (song.path) {
                this.audio.src = song.path;
            }
        } catch (error) {
            console.error('Error loading song:', error);
            Utils.showToast('Error loading song');
        }
        this.updateMediaSession();
    },

    play() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        if (this.audio.src) {
            this.audio.play().catch(e => console.log('Playback prevented:', e));
        }
    },

    pause() {
        this.audio.pause();
    },

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    next() {
        if (this.queue.length === 0) return;
        if (this.repeatMode === 2) {
            this.seek(0);
            this.play();
            return;
        }
        if (this.isShuffled) {
            const currentIndex = this.shuffleQueue.indexOf(this.queueIndex);
            let nextIndex = currentIndex + 1;
            if (nextIndex >= this.shuffleQueue.length) {
                if (this.repeatMode === 1) {
                    nextIndex = 0;
                } else {
                    this.pause();
                    return;
                }
            }
            this.queueIndex = this.shuffleQueue[nextIndex];
        } else {
            this.queueIndex++;
            if (this.queueIndex >= this.queue.length) {
                if (this.repeatMode === 1) {
                    this.queueIndex = 0;
                } else {
                    this.pause();
                    return;
                }
            }
        }
        this.loadSong(this.queue[this.queueIndex]);
        this.play();
    },

    previous() {
        if (this.audio.currentTime > 3) {
            this.seek(0);
            return;
        }
        if (this.queue.length === 0) return;
        if (this.isShuffled) {
            const currentIndex = this.shuffleQueue.indexOf(this.queueIndex);
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = this.shuffleQueue.length - 1;
            }
            this.queueIndex = this.shuffleQueue[prevIndex];
        } else {
            this.queueIndex--;
            if (this.queueIndex < 0) {
                this.queueIndex = this.queue.length - 1;
            }
        }
        this.loadSong(this.queue[this.queueIndex]);
        this.play();
    },

    seek(time) {
        if (this.audio) {
            this.audio.currentTime = Utils.clamp(time, 0, this.audio.duration || 0);
        }
    },

    seekPercent(percent) {
        if (this.audio && this.audio.duration) {
            this.audio.currentTime = this.audio.duration * (percent / 100);
        }
    },

    setVolume(value) {
        this.volume = Utils.clamp(value, 0, 1);
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        this.saveSettings();
    },

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        if (this.isShuffled) {
            this.generateShuffleQueue();
        }
        this.saveSettings();
        return this.isShuffled;
    },

    cycleRepeatMode() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        this.saveSettings();
        return this.repeatMode;
    },

    generateShuffleQueue() {
        this.shuffleQueue = [...Array(this.queue.length).keys()];
        for (let i = this.shuffleQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffleQueue[i], this.shuffleQueue[j]] = [this.shuffleQueue[j], this.shuffleQueue[i]];
        }
        const currentPos = this.shuffleQueue.indexOf(this.queueIndex);
        if (currentPos > 0) {
            [this.shuffleQueue[0], this.shuffleQueue[currentPos]] = [this.shuffleQueue[currentPos], this.shuffleQueue[0]];
        }
    },

    setQueue(songs, startIndex = 0) {
        this.queue = [...songs];
        this.queueIndex = startIndex;
        if (this.isShuffled) {
            this.generateShuffleQueue();
        }
        if (this.queue.length > 0 && this.queueIndex >= 0) {
            this.loadSong(this.queue[this.queueIndex]);
        }
    },

    playSongAt(index) {
        if (index >= 0 && index < this.queue.length) {
            this.queueIndex = index;
            this.loadSong(this.queue[index]);
            this.play();
        }
    },

    setEQBand(index, gain) {
        if (this.eqFilters[index]) {
            this.eqFilters[index].gain.value = gain;
        }
    },

    setEQPreset(preset) {
        const presets = {
            flat: [0, 0, 0, 0, 0],
            bass: [5, 4, 2, 0, -1],
            treble: [-1, 0, 2, 4, 5],
            vocal: [-2, -1, 2, 1, -1],
            rock: [4, 3, 1, 2, 4],
            pop: [-1, 2, 4, 2, -1],
            jazz: [3, 2, 1, 2, 3],
            classical: [3, 2, 0, 2, 4],
            electronic: [4, 3, 0, 2, 4]
        };
        const settings = presets[preset] || presets.flat;
        settings.forEach((value, i) => {
            this.setEQBand(i, value);
        });
    },

    setSleepTimer(minutes) {
        if (this.sleepTimer) {
            clearTimeout(this.sleepTimer);
            this.sleepTimer = null;
        }
        if (minutes > 0) {
            this.sleepTimerEnd = Date.now() + minutes * 60 * 1000;
            this.sleepTimer = setTimeout(() => {
                this.pause();
                this.sleepTimerEnd = null;
                Utils.showToast('Sleep timer ended');
            }, minutes * 60 * 1000);
        } else {
            this.sleepTimerEnd = null;
        }
    },

    cancelSleepTimer() {
        if (this.sleepTimer) {
            clearTimeout(this.sleepTimer);
            this.sleepTimer = null;
            this.sleepTimerEnd = null;
        }
    },

    getSleepTimerRemaining() {
        if (!this.sleepTimerEnd) return null;
        return Math.max(0, this.sleepTimerEnd - Date.now());
    },

    getAnalyserData() {
        if (!this.analyser) return null;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    },

    onTimeUpdate() {
        if (!this.currentSong) return;
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration || 0;
        if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(currentTime, duration);
        }
    },

    onMetadataLoaded() {
        if (this.currentSong && this.audio.duration) {
            this.currentSong.duration = this.audio.duration * 1000;
        }
    },

    onEnded() {
        this.next();
    },

    onPlay() {
        this.isPlaying = true;
        if (this.onPlayCallback) {
            this.onPlayCallback();
        }
    },

    onPause() {
        this.isPlaying = false;
        if (this.onPauseCallback) {
            this.onPauseCallback();
        }
    },

    onCanPlay() {
        if (this.onCanPlayCallback) {
            this.onCanPlayCallback();
        }
    },

    onError(e) {
        console.error('Audio error:', e);
        Utils.showToast('Error playing track');
    },

    onVisibilityChange() {},

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.seek(this.audio.currentTime - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.seek(this.audio.currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(this.volume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(this.volume - 0.1);
                break;
        }
    }
};

const MusicApp = {
    songs: [],
    folders: [],
    playlists: [],
    currentPage: 'home',
    db: null,
    visualizerAnimation: null,

    async init() {
        try {
            this.db = await this.initDatabase();
            MusicPlayer.init();
            this.bindEvents();
            this.loadTheme();
            await this.loadInitialData();
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    },

    async initDatabase() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('MusicPlayerDB', 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('musicLibrary')) {
                        db.createObjectStore('musicLibrary', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('playlists')) {
                        db.createObjectStore('playlists', { keyPath: 'id' });
                    }
                };
            } catch (e) {
                reject(e);
            }
        });
    },

    bindEvents() {
        this.bindNavigation();
        this.bindPlayerControls();
        this.bindSearch();
        this.bindQueue();
        this.bindEqualizer();
        this.bindSleepTimer();
        this.bindPlaylistControls();
        this.bindSettings();
        this.bindFolderView();
        this.bindAddMusic();
    },

    bindAddMusic() {
        const addFilesBtn = document.getElementById('addFilesBtn');
        const fileInput = document.getElementById('fileInput');
        const addMusicBtn = document.getElementById('addMusicBtn');
        const addMusicInput = document.getElementById('addMusicInput');
        
        if (addFilesBtn && fileInput) {
            addFilesBtn.addEventListener('click', () => fileInput.click());
        }
        if (addMusicBtn && addMusicInput) {
            addMusicBtn.addEventListener('click', () => addMusicInput.click());
        }
        
        const handleFileSelect = async (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                await this.addFilesToLibrary(files);
            }
            e.target.value = '';
        };
        
        if (fileInput) fileInput.addEventListener('change', handleFileSelect);
        if (addMusicInput) addMusicInput.addEventListener('change', handleFileSelect);
    },

    bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateTo(item.dataset.page);
            });
        });
    },

    bindPlayerControls() {
        const miniPlayer = document.getElementById('miniPlayer');
        if (miniPlayer) {
            miniPlayer.addEventListener('click', (e) => {
                if (!e.target.closest('.mini-player-controls')) {
                    this.openFullPlayer();
                }
            });
        }
        
        document.getElementById('collapsePlayerBtn')?.addEventListener('click', () => this.closeFullPlayer());
        document.getElementById('miniPlayBtn')?.addEventListener('click', (e) => { e.stopPropagation(); MusicPlayer.togglePlay(); });
        document.getElementById('miniPrevBtn')?.addEventListener('click', (e) => { e.stopPropagation(); MusicPlayer.previous(); });
        document.getElementById('miniNextBtn')?.addEventListener('click', (e) => { e.stopPropagation(); MusicPlayer.next(); });
        document.getElementById('playBtn')?.addEventListener('click', () => MusicPlayer.togglePlay());
        document.getElementById('prevBtn')?.addEventListener('click', () => MusicPlayer.previous());
        document.getElementById('nextBtn')?.addEventListener('click', () => MusicPlayer.next());
        
        document.getElementById('shuffleBtn')?.addEventListener('click', () => {
            const isShuffled = MusicPlayer.toggleShuffle();
            document.getElementById('shuffleBtn').classList.toggle('active', isShuffled);
        });
        
        document.getElementById('repeatBtn')?.addEventListener('click', () => {
            const mode = MusicPlayer.cycleRepeatMode();
            document.getElementById('repeatBtn').classList.toggle('active', mode > 0);
        });
        
        document.getElementById('favoriteBtn')?.addEventListener('click', () => this.toggleCurrentFavorite());
        document.getElementById('volumeSlider')?.addEventListener('input', (e) => MusicPlayer.setVolume(e.target.value / 100));
        
        this.bindProgressBar();
    },

    bindProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (!progressBar) return;
        let isDragging = false;
        
        const updateProgress = (e) => {
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const percent = ((x - rect.left) / rect.width) * 100;
            MusicPlayer.seekPercent(Math.max(0, Math.min(100, percent)));
        };
        
        progressBar.addEventListener('mousedown', (e) => { isDragging = true; progressBar.classList.add('dragging'); updateProgress(e); });
        progressBar.addEventListener('touchstart', (e) => { isDragging = true; progressBar.classList.add('dragging'); updateProgress(e); }, { passive: true });
        document.addEventListener('mousemove', (e) => { if (isDragging) updateProgress(e); });
        document.addEventListener('touchmove', (e) => { if (isDragging) updateProgress(e); }, { passive: true });
        document.addEventListener('mouseup', () => { isDragging = false; progressBar.classList.remove('dragging'); });
        document.addEventListener('touchend', () => { isDragging = false; progressBar.classList.remove('dragging'); });
    },

    bindSearch() {
        const searchToggle = document.getElementById('searchToggle');
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('searchInput');
        const closeSearchBtn = document.getElementById('closeSearchBtn');
        
        searchToggle?.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            searchInput?.focus();
        });
        
        closeSearchBtn?.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            if (searchInput) {
                searchInput.value = '';
                document.getElementById('searchResults').innerHTML = '<p class="search-hint">Start typing to search</p>';
            }
        });
        
        if (searchInput) {
            const performSearch = Utils.debounce(async (query) => {
                if (!query.trim()) {
                    document.getElementById('searchResults').innerHTML = '<p class="search-hint">Start typing to search</p>';
                    return;
                }
                const results = this.searchSongs(query);
                this.renderSearchResults(results);
            }, 300);
            searchInput.addEventListener('input', (e) => performSearch(e.target.value));
        }
    },

    bindQueue() {
        document.getElementById('queueBtn')?.addEventListener('click', () => this.openQueue());
        document.getElementById('closeQueueBtn')?.addEventListener('click', () => document.getElementById('queueOverlay').classList.remove('active'));
    },

    bindEqualizer() {
        document.getElementById('equalizerBtn')?.addEventListener('click', () => document.getElementById('equalizerOverlay').classList.add('active'));
        document.getElementById('closeEqualizerBtn')?.addEventListener('click', () => document.getElementById('equalizerOverlay').classList.remove('active'));
        
        document.getElementById('eqPresetSelect')?.addEventListener('change', (e) => MusicPlayer.setEQPreset(e.target.value));
        
        ['60', '230', '910', '3600', '14000'].forEach((freq, i) => {
            const slider = document.getElementById(`eq${freq}`);
            const valueDisplay = document.getElementById(`eq${freq}Value`);
            slider?.addEventListener('input', () => {
                MusicPlayer.setEQBand(i, parseInt(slider.value));
                if (valueDisplay) valueDisplay.textContent = slider.value;
            });
        });
    },

    bindSleepTimer() {
        document.getElementById('sleepTimerBtn')?.addEventListener('click', () => document.getElementById('sleepTimerModal').classList.add('active'));
        
        document.getElementById('cancelTimerBtn')?.addEventListener('click', () => {
            MusicPlayer.cancelSleepTimer();
            document.getElementById('sleepTimerModal').classList.remove('active');
            document.getElementById('sleepTimerDisplay').style.display = 'none';
            Utils.showToast('Sleep timer cancelled');
        });
        
        document.querySelectorAll('.timer-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.minutes);
                MusicPlayer.setSleepTimer(minutes);
                document.getElementById('sleepTimerModal').classList.remove('active');
                document.getElementById('sleepTimerDisplay').style.display = 'flex';
                Utils.showToast(`Sleep timer set for ${minutes} minutes`);
            });
        });
        
        setInterval(() => {
            const remaining = MusicPlayer.getSleepTimerRemaining();
            if (remaining !== null) {
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                const el = document.getElementById('sleepTimerRemaining');
                if (el) el.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },

    bindPlaylistControls() {
        document.getElementById('createPlaylistBtn')?.addEventListener('click', () => {
            document.getElementById('playlistModal').classList.add('active');
            document.getElementById('playlistNameInput').value = '';
            document.getElementById('playlistNameInput').focus();
        });
        
        document.getElementById('savePlaylistBtn')?.addEventListener('click', async () => {
            const name = document.getElementById('playlistNameInput').value.trim();
            if (name) {
                await this.createPlaylist(name);
                document.getElementById('playlistModal').classList.remove('active');
            }
        });
        
        document.getElementById('cancelPlaylistBtn')?.addEventListener('click', () => document.getElementById('playlistModal').classList.remove('active'));
        
        document.querySelectorAll('.playlist-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.playlist-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const tabId = tab.dataset.tab === 'my' ? 'myPlaylists' : 
                              tab.dataset.tab === 'favorites' ? 'favoritesList' : 'mostPlayedList';
                document.getElementById(tabId)?.classList.add('active');
            });
        });
    },

    bindSettings() {
        document.getElementById('themeSelect')?.addEventListener('change', (e) => {
            Utils.localStorage.set('theme', e.target.value);
            this.loadTheme();
        });
        
        document.getElementById('crossfadeRange')?.addEventListener('input', (e) => {
            document.getElementById('crossfadeValue').textContent = `${e.target.value}s`;
            Utils.localStorage.set('crossfade', parseInt(e.target.value));
        });
        
        document.getElementById('clearLibraryBtn')?.addEventListener('click', async () => {
            if (confirm('Clear all songs from library?')) {
                await this.clearLibrary();
            }
        });
    },

    bindFolderView() {
        document.getElementById('closeFolderBtn')?.addEventListener('click', () => {
            document.getElementById('folderContentOverlay').classList.remove('active');
        });
    },

    async loadInitialData() {
        this.songs = await this.getAllSongs();
        this.folders = this.getFoldersFromSongs(this.songs);
        this.playlists = await this.getAllPlaylists();
        
        const songCountEl = document.getElementById('songCount');
        const librarySongCountEl = document.getElementById('librarySongCount');
        if (songCountEl) songCountEl.textContent = `${this.songs.length} songs`;
        if (librarySongCountEl) librarySongCountEl.textContent = this.songs.length;
        
        this.renderAllSongs();
        this.renderFolders();
        this.renderRecentTracks();
        this.renderPlaylists();
        this.renderFavorites();
        this.renderMostPlayed();
    },

    async getAllSongs() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('musicLibrary', 'readonly');
            const store = transaction.objectStore('musicLibrary');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async saveSong(song) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('musicLibrary', 'readwrite');
            const store = transaction.objectStore('musicLibrary');
            const request = store.put(song);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    searchSongs(query) {
        const lowerQuery = query.toLowerCase();
        return this.songs.filter(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery) ||
            song.album.toLowerCase().includes(lowerQuery)
        );
    },

    getFoldersFromSongs(songs) {
        const folders = new Map();
        songs.forEach(song => {
            const parts = song.path.split('/');
            let currentPath = '';
            parts.slice(0, -1).forEach(folderName => {
                currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
                if (!folders.has(currentPath)) {
                    folders.set(currentPath, { path: currentPath, name: folderName, songCount: 0, songs: [] });
                }
                folders.get(currentPath).songCount++;
                folders.get(currentPath).songs.push(song);
            });
        });
        return Array.from(folders.values());
    },

    async getAllPlaylists() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('playlists', 'readonly');
            const store = transaction.objectStore('playlists');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async createPlaylist(name) {
        const playlist = {
            id: Utils.generateId(),
            name: name,
            songs: [],
            coverImage: Utils.getDefaultAlbumArt(),
            createdAt: Date.now()
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('playlists', 'readwrite');
            const store = transaction.objectStore('playlists');
            const request = store.put(playlist);
            request.onsuccess = () => {
                this.playlists.push(playlist);
                this.renderPlaylists();
                Utils.showToast('Playlist created');
                resolve(playlist);
            };
            request.onerror = () => reject(request.error);
        });
    },

    navigateTo(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `${page}Page`);
        });
        this.currentPage = page;
    },

    loadTheme() {
        const savedTheme = Utils.localStorage.get('theme', 'system');
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = savedTheme;
        
        if (savedTheme === 'light') {
            document.body.setAttribute('data-theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
        }
    },

    renderAllSongs() {
        const container = document.getElementById('allSongsList');
        const prompt = document.getElementById('addMusicPrompt');
        
        if (!container) return;
        
        if (this.songs.length === 0) {
            container.innerHTML = '';
            if (prompt) prompt.style.display = 'block';
            return;
        }
        
        if (prompt) prompt.style.display = 'none';
        
        container.innerHTML = this.songs.map((song, index) => this.createSongItem(song, index)).join('');
        this.bindSongItems(container);
    },

    renderRecentTracks() {
        const container = document.getElementById('recentTracks');
        const section = document.getElementById('recentSection');
        if (!container || !section) return;
        
        const recentSongs = this.songs
            .filter(s => s.lastPlayed)
            .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
            .slice(0, 10);
        
        if (recentSongs.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        container.innerHTML = recentSongs.map(song => `
            <div class="song-card" data-id="${song.id}">
                <div class="song-album-art">
                    <img src="${song.albumArt}" alt="${song.title}" onerror="this.src='${Utils.getDefaultAlbumArt()}'">
                </div>
                <p class="song-title">${this.escapeHtml(song.title)}</p>
                <p class="song-artist">${this.escapeHtml(song.artist)}</p>
            </div>
        `).join('');
        
        container.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = this.songs.findIndex(s => s.id === card.dataset.id);
                if (index !== -1) {
                    MusicPlayer.setQueue(this.songs, index);
                    MusicPlayer.play();
                    this.updatePlayerUI();
                }
            });
        });
    },

    renderFolders() {
        const container = document.getElementById('folderList');
        if (!container) return;
        
        if (this.folders.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">No folders found. Add music files to see folders.</p>';
            return;
        }
        
        container.innerHTML = this.folders.map(folder => `
            <div class="folder-item" data-path="${this.escapeHtml(folder.path)}">
                <div class="folder-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
                    </svg>
                </div>
                <div class="folder-info">
                    <p class="folder-name">${this.escapeHtml(folder.name)}</p>
                    <p class="folder-count">${folder.songCount} songs</p>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', () => this.openFolder(item.dataset.path));
        });
    },

    openFolder(path) {
        const folder = this.folders.find(f => f.path === path);
        if (!folder) return;
        
        document.getElementById('folderTitle').textContent = folder.name;
        document.getElementById('folderContentOverlay').classList.add('active');
        
        const container = document.getElementById('folderSongs');
        if (container) {
            container.innerHTML = folder.songs.map((song, index) => this.createSongItem(song, index)).join('');
            this.bindSongItems(container);
        }
    },

    renderPlaylists() {
        const grid = document.getElementById('playlistGrid');
        if (!grid) return;
        
        if (this.playlists.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">No playlists yet. Create one!</p>';
            return;
        }
        
        grid.innerHTML = this.playlists.map(playlist => `
            <div class="playlist-card" data-id="${playlist.id}">
                <div class="playlist-cover">
                    <img src="${playlist.coverImage}" alt="${playlist.name}" onerror="this.style.display='none'">
                </div>
                <p class="playlist-name">${this.escapeHtml(playlist.name)}</p>
                <p class="playlist-song-count">${playlist.songs.length} songs</p>
            </div>
        `).join('');
        
        grid.querySelectorAll('.playlist-card').forEach(card => {
            card.addEventListener('click', () => this.openPlaylist(card.dataset.id));
        });
    },

    openPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.songs.length === 0) return;
        
        const playlistSongs = playlist.songs.map(id => this.songs.find(s => s.id === id)).filter(s => s);
        if (playlistSongs.length > 0) {
            MusicPlayer.setQueue(playlistSongs, 0);
            MusicPlayer.play();
            this.updatePlayerUI();
        }
    },

    renderFavorites() {
        const container = document.getElementById('favoritesSongs');
        if (!container) return;
        
        const favorites = this.songs.filter(s => s.favorite);
        if (favorites.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">No favorite songs yet.</p>';
            return;
        }
        
        container.innerHTML = favorites.map((song, index) => this.createSongItem(song, index)).join('');
        this.bindSongItems(container);
    },

    renderMostPlayed() {
        const container = document.getElementById('mostPlayedSongs');
        if (!container) return;
        
        const mostPlayed = this.songs
            .filter(s => s.playCount > 0)
            .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
            .slice(0, 20);
        
        if (mostPlayed.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">No play history yet.</p>';
            return;
        }
        
        container.innerHTML = mostPlayed.map((song, index) => this.createSongItem(song, index)).join('');
        this.bindSongItems(container);
    },

    createSongItem(song, index) {
        const isPlaying = MusicPlayer.currentSong && MusicPlayer.currentSong.id === song.id;
        return `
            <div class="song-item ${isPlaying ? 'playing' : ''}" data-id="${song.id}" data-index="${index}">
                <div class="song-album-art">
                    <img src="${song.albumArt}" alt="${song.title}" onerror="this.src='${Utils.getDefaultAlbumArt()}'">
                </div>
                <div class="song-info">
                    <p class="song-title">${this.escapeHtml(song.title)}</p>
                    <p class="song-artist">${this.escapeHtml(song.artist)}</p>
                </div>
                <span class="song-duration">${Utils.formatDuration(song.duration)}</span>
                <div class="song-actions">
                    <button class="icon-btn action-btn" data-action="favorite" title="Favorite">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${song.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    bindSongItems(container) {
        container.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.song-actions')) {
                    const action = e.target.closest('.song-actions').dataset.action;
                    this.handleSongAction(action, item.dataset.id);
                    return;
                }
                const index = parseInt(item.dataset.index);
                MusicPlayer.setQueue(this.songs, index);
                MusicPlayer.play();
                this.updatePlayerUI();
            });
        });
    },

    handleSongAction(action, songId) {
        if (action === 'favorite') {
            this.toggleFavorite(songId);
        }
    },

    async toggleFavorite(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (song) {
            song.favorite = !song.favorite;
            await this.saveSong(song);
            Utils.showToast(song.favorite ? 'Added to favorites' : 'Removed from favorites');
            this.renderAllSongs();
            this.renderFavorites();
        }
    },

    renderSearchResults(results) {
        const container = document.getElementById('searchResults');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = '<p class="search-hint">No results found</p>';
            return;
        }
        
        container.innerHTML = results.map(song => `
            <div class="search-result-item" data-id="${song.id}">
                <div class="song-album-art">
                    <img src="${song.albumArt}" alt="${song.title}" onerror="this.src='${Utils.getDefaultAlbumArt()}'">
                </div>
                <div class="song-info">
                    <p class="song-title">${this.escapeHtml(song.title)}</p>
                    <p class="song-artist">${this.escapeHtml(song.artist)}</p>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = this.songs.findIndex(s => s.id === item.dataset.id);
                if (index !== -1) {
                    MusicPlayer.setQueue(this.songs, index);
                    MusicPlayer.play();
                    this.updatePlayerUI();
                    document.getElementById('searchOverlay').classList.remove('active');
                }
            });
        });
    },

    openFullPlayer() {
        document.getElementById('fullPlayerOverlay').classList.add('active');
        this.startVisualizer();
    },

    closeFullPlayer() {
        document.getElementById('fullPlayerOverlay').classList.remove('active');
        this.stopVisualizer();
    },

    openQueue() {
        const queueOverlay = document.getElementById('queueOverlay');
        const queueList = document.getElementById('queueList');
        
        queueOverlay.classList.add('active');
        
        if (queueList) {
            queueList.innerHTML = MusicPlayer.queue.map((song, index) => `
                <div class="queue-item ${index === MusicPlayer.queueIndex ? 'playing' : ''}" data-index="${index}">
                    <div class="song-album-art" style="width: 40px; height: 40px;">
                        <img src="${song.albumArt}" alt="${song.title}" onerror="this.src='${Utils.getDefaultAlbumArt()}'">
                    </div>
                    <div class="queue-item-info">
                        <p class="queue-item-title">${this.escapeHtml(song.title)}</p>
                        <p class="queue-item-artist">${this.escapeHtml(song.artist)}</p>
                    </div>
                </div>
            `).join('');
            
            queueList.querySelectorAll('.queue-item').forEach(item => {
                item.addEventListener('click', () => {
                    MusicPlayer.playSongAt(parseInt(item.dataset.index));
                    this.updatePlayerUI();
                    queueOverlay.classList.remove('active');
                });
            });
        }
    },

    updatePlayerUI() {
        const song = MusicPlayer.currentSong;
        const miniPlayer = document.getElementById('miniPlayer');
        
        if (!song) {
            miniPlayer?.classList.add('hidden');
            return;
        }
        
        miniPlayer?.classList.remove('hidden');
        
        const miniImg = document.getElementById('miniAlbumImg');
        const miniTitle = document.getElementById('miniTrackTitle');
        const miniArtist = document.getElementById('miniTrackArtist');
        const fullImg = document.getElementById('fullAlbumImg');
        const fullTitle = document.getElementById('fullTrackTitle');
        const fullArtist = document.getElementById('fullTrackArtist');
        
        if (miniImg) miniImg.src = song.albumArt;
        if (miniTitle) miniTitle.textContent = song.title;
        if (miniArtist) miniArtist.textContent = song.artist;
        if (fullImg) fullImg.src = song.albumArt;
        if (fullTitle) fullTitle.textContent = song.title;
        if (fullArtist) fullArtist.textContent = song.artist;
        
        this.updatePlayPauseIcons();
        this.updateShuffleState();
        this.updateRepeatIcon(MusicPlayer.repeatMode);
        this.updateFavoriteState();
        document.title = `${song.title} - ${song.artist} | Music Player`;
    },

    updatePlayPauseIcons() {
        const playIcon = `<path d="M8 5v14l11-7z"></path>`;
        const pauseIcon = `<path d="M6 4h4v16H6zM14 4h4v16h-4z"></path>`;
        
        const miniIcon = document.getElementById('miniPlayIcon');
        const fullIcon = document.getElementById('playIcon');
        const playBtn = document.getElementById('playBtn');
        
        if (MusicPlayer.isPlaying) {
            if (miniIcon) miniIcon.innerHTML = pauseIcon;
            if (fullIcon) fullIcon.innerHTML = pauseIcon;
            playBtn?.classList.add('playing');
        } else {
            if (miniIcon) miniIcon.innerHTML = playIcon;
            if (fullIcon) fullIcon.innerHTML = playIcon;
            playBtn?.classList.remove('playing');
        }
    },

    updateShuffleState() {
        document.getElementById('shuffleBtn')?.classList.toggle('active', MusicPlayer.isShuffled);
    },

    updateRepeatIcon(mode) {
        document.getElementById('repeatBtn')?.classList.toggle('active', mode > 0);
    },

    updateFavoriteState() {
        const song = MusicPlayer.currentSong;
        const heartIcon = document.getElementById('heartIcon');
        const favoriteBtn = document.getElementById('favoriteBtn');
        
        if (song && heartIcon) {
            heartIcon.setAttribute('fill', song.favorite ? 'currentColor' : 'none');
        }
        if (favoriteBtn && song) {
            favoriteBtn.classList.toggle('active', song.favorite);
        }
    },

    async toggleCurrentFavorite() {
        const song = MusicPlayer.currentSong;
        if (song) {
            song.favorite = !song.favorite;
            await this.saveSong(song);
            this.updateFavoriteState();
            this.renderAllSongs();
            this.renderFavorites();
            Utils.showToast(song.favorite ? 'Added to favorites' : 'Removed from favorites');
        }
    },

    startVisualizer() {
        if (!MusicPlayer.analyser) return;
        const canvas = document.getElementById('visualizerCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 320;
        
        const draw = () => {
            if (!document.getElementById('fullPlayerOverlay')?.classList.contains('active')) return;
            this.visualizerAnimation = requestAnimationFrame(draw);
            const dataArray = MusicPlayer.getAnalyserData();
            if (!dataArray) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = canvas.width / dataArray.length;
            let x = 0;
            
            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
                ctx.fillStyle = `rgba(29, 185, 84, ${dataArray[i] / 255})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
                x += barWidth;
            }
        };
        draw();
    },

    stopVisualizer() {
        if (this.visualizerAnimation) {
            cancelAnimationFrame(this.visualizerAnimation);
            this.visualizerAnimation = null;
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    onTimeUpdate(currentTime, duration) {
        const progressFill = document.getElementById('progressFill');
        const miniProgressBar = document.getElementById('miniProgressBar');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');
        
        const progress = duration ? (currentTime / duration) * 100 : 0;
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (miniProgressBar) miniProgressBar.style.width = `${progress}%`;
        if (currentTimeEl) currentTimeEl.textContent = Utils.formatTime(currentTime);
        if (totalTimeEl && duration) totalTimeEl.textContent = Utils.formatTime(duration);
    },

    onPlay() {
        this.updatePlayPauseIcons();
        this.renderAllSongs();
    },

    onPause() {
        this.updatePlayPauseIcons();
    },

    onCanPlay() {
        this.updatePlayerUI();
    },

    async addFilesToLibrary(files) {
        Utils.showToast(`Adding ${files.length} files...`);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const song = {
                id: Utils.generateId(),
                title: Utils.getFileNameWithoutExtension(file.name),
                artist: 'Unknown Artist',
                album: 'Unknown Album',
                duration: 0,
                path: file.name,
                fileUrl: URL.createObjectURL(file),
                fileName: file.name,
                albumArt: Utils.getDefaultAlbumArt(),
                size: file.size,
                lastModified: file.lastModified,
                addedAt: Date.now(),
                lastPlayed: null,
                playCount: 0,
                favorite: false
            };
            await this.saveSong(song);
        }
        
        this.songs = await this.getAllSongs();
        this.folders = this.getFoldersFromSongs(this.songs);
        
        const songCountEl = document.getElementById('songCount');
        const librarySongCountEl = document.getElementById('librarySongCount');
        if (songCountEl) songCountEl.textContent = `${this.songs.length} songs`;
        if (librarySongCountEl) librarySongCountEl.textContent = this.songs.length;
        
        this.renderAllSongs();
        this.renderFolders();
        this.renderRecentTracks();
        Utils.showToast(`Added ${files.length} songs!`);
    },

    async clearLibrary() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('musicLibrary', 'readwrite');
            const store = transaction.objectStore('musicLibrary');
            const request = store.clear();
            
            request.onsuccess = () => {
                this.songs = [];
                this.folders = [];
                const songCountEl = document.getElementById('songCount');
                const librarySongCountEl = document.getElementById('librarySongCount');
                if (songCountEl) songCountEl.textContent = '0 songs';
                if (librarySongCountEl) librarySongCountEl.textContent = '0';
                this.renderAllSongs();
                this.renderFolders();
                Utils.showToast('Library cleared');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }
};

MusicPlayer.onTimeUpdateCallback = (currentTime, duration) => MusicApp.onTimeUpdate(currentTime, duration);
MusicPlayer.onPlayCallback = () => MusicApp.onPlay();
MusicPlayer.onPauseCallback = () => MusicApp.onPause();
MusicPlayer.onCanPlayCallback = () => MusicApp.onCanPlay();

document.addEventListener('DOMContentLoaded', () => {
    MusicApp.init();
});
