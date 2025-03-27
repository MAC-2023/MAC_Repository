let audioContext;
let playerShootSound, enemyShootSound, explosionSound, powerupSound;

function initAudio() {
    if (!audioContext) {
        console.log('Creating new audio context');
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Base64 encoded sounds - using placeholders for now
    const laserSoundBase64 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA/+NwwAAAAAAAAAAAAEluZm8AAAAPAAAACwAAESQAKioqKioqKioqPz8/Pz8/Pz8/VVVVVVVVVVVVampqampqampqf39/f[...]";
    const alienDeathSoundBase64 = "//vgZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAmAACfLgAGBg0NDRQUGhoaISEhKCgvLy81NTU8PENDQ0pKUFBQV1dXXl5lZWVra2tycnl5eYCAhoaGjY2NlJSa[...]";

    // Decode base64 to ArrayBuffer
    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Load audio from base64
    function loadAudioFromBase64(base64String) {
        return new Promise((resolve, reject) => {
            try {
                const arrayBuffer = base64ToArrayBuffer(base64String);
                audioContext.decodeAudioData(arrayBuffer,
                    (buffer) => resolve({ buffer }),
                    (error) => reject(error)
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    // Load all sounds
    Promise.all([
        loadAudioFromBase64(laserSoundBase64),
        loadAudioFromBase64(alienDeathSoundBase64)
    ]).then(([laserSound, deathSound]) => {
        playerShootSound = laserSound;
        enemyShootSound = laserSound;
        alienDeathSound = deathSound;
        console.log('Sounds loaded successfully');
    }).catch(error => {
        console.error('Error loading sounds:', error);
        createFallbackSounds();
    });

    console.log('Audio system initialized successfully');
}

// Fallback synthesized sounds
function createFallbackSounds() {
    const laserBuffer = audioContext.createBuffer(1, 44100 * 0.1, 44100);
    const laserData = laserBuffer.getChannelData(0);

    for (let i = 0; i < laserData.length; i++) {
        const t = i / laserData.length;
        const freqStart = 2000;
        const freqEnd = 500;
        const freq = freqStart - (freqStart - freqEnd) * Math.pow(t, 0.3);
        const envelope = Math.pow(1 - t, 2) * (t < 0.05 ? t / 0.05 : 1);

        laserData[i] = (
            Math.sin(i * freq * 0.02) * 0.6 +
            Math.sin(i * freq * 0.04) * 0.3 +
            Math.sin(i * freq * 0.08) * 0.1
        ) * envelope;
    }

    const deathBuffer = audioContext.createBuffer(1, 44100 * 0.3, 44100);
    const deathData = deathBuffer.getChannelData(0);
    for (let i = 0; i < deathData.length; i++) {
        const t = i / deathData.length;
        const freq = 200 + Math.random() * 100;
        const envelope = Math.pow(1 - t, 1.5);
        deathData[i] = Math.sin(i * freq * 0.02) * envelope;
    }

    playerShootSound = { buffer: laserBuffer };
    enemyShootSound = { buffer: laserBuffer };
    alienDeathSound = { buffer: deathBuffer };
    console.log('Created fallback synthesized sounds');
}

function playSound(sound) {
    try {
        if (!sound || !sound.buffer) {
            console.warn('Attempted to play sound that is not loaded');
            return;
        }

        if (!audioContext) {
            console.warn('Audio context not available');
            return;
        }

        if (audioContext.state === 'suspended') {
            console.log('Resuming suspended audio context');
            audioContext.resume();
        }

        const newSound = audioContext.createBufferSource();
        newSound.buffer = sound.buffer;
        newSound.connect(audioContext.destination);
        newSound.start(0);
        console.log('Sound played successfully');
    } catch (error) {
        console.error('Sound playback failed:', error);
    }
}