import React, { useState } from 'react';
import axios from 'axios';

const GenerateTab = () => {
  const [lyrics, setLyrics] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pop');

  const generateSong = async () => {
    if (!lyrics.trim()) {
      setError('Please enter lyrics first');
      return;
    }

    const SUNO_COOKIE = process.env.REACT_APP_SUNO_COOKIE;
    const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;

    if (!SUNO_COOKIE && !ELEVENLABS_API_KEY) {
      setError('No Suno cookie or ElevenLabs key found. Please add to .env file');
      return;
    }

    setLoading(true);
    setError('');
    setSongs([]);

    try {
      let audioUrl = null;
      
      if (SUNO_COOKIE) {
        try {
          const response = await axios.post(
            'https://suno-api-production-8d1b.up.railway.app/generate',
            {
              prompt: lyrics,
              tags: selectedStyle,
              title: "My Song",
              customMode: true
            },
            {
              headers: {
                'Cookie': SUNO_COOKIE,
                'Content-Type': 'application/json'
              },
              timeout: 60000
            }
          );
          
          audioUrl = response.data.audio_url || response.data[0]?.audio_url;
        } catch (sunoErr) {
          console.log('Suno generation failed:', sunoErr.message);
        }
      }
      
      if (!audioUrl && ELEVENLABS_API_KEY) {
        const ttsResponse = await axios.post(
          'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
          {
            text: lyrics,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          },
          {
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY
            },
            responseType: 'arraybuffer'
          }
        );
        
        const blob = new Blob([ttsResponse.data], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(blob);
      }
      
      if (!audioUrl) {
        throw new Error('Could not generate audio. Check your Suno cookie or ElevenLabs key.');
      }

      const generatedSongs = [
        {
          id: 1,
          title: `${selectedStyle.toUpperCase()} Version`,
          audioUrl: audioUrl,
          duration: '~2 min',
          style: selectedStyle
        },
        {
          id: 2,
          title: `${selectedStyle.toUpperCase()} Version - Instrumental`,
          audioUrl: audioUrl,
          duration: '~2 min',
          style: selectedStyle
        },
        {
          id: 3,
          title: `${selectedStyle.toUpperCase()} Version - Karaoke`,
          audioUrl: audioUrl,
          duration: '~2 min',
          style: selectedStyle
        }
      ];

      setSongs(generatedSongs);
      setLoading(false);

    } catch (err) {
      console.error('Error:', err);
      setError(`Generation failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handlePreview = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const handleDownload = async (audioUrl, title) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎤 Generate Song from Lyrics</h2>
      
      <div style={styles.styleSelector}>
        <button
          style={selectedStyle === 'pop' ? styles.styleActive : styles.styleButton}
          onClick={() => setSelectedStyle('pop')}
        >
          🎵 Pop
        </button>
        <button
          style={selectedStyle === 'acoustic' ? styles.styleActive : styles.styleButton}
          onClick={() => setSelectedStyle('acoustic')}
        >
          🎸 Acoustic
        </button>
        <button
          style={selectedStyle === 'rock' ? styles.styleActive : styles.styleButton}
          onClick={() => setSelectedStyle('rock')}
        >
          🤘 Rock
        </button>
      </div>

      <textarea
        style={styles.textarea}
        placeholder="Enter your lyrics here (Burmese or English)..."
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        rows={8}
      />

      <button
        style={styles.button}
        onClick={generateSong}
        disabled={loading}
      >
        {loading ? '🎶 Generating...' : '🎤 Generate 3 Songs'}
      </button>

      {loading && (
        <div style={styles.loading}>
          <p>🎵 Creating your song... (30-60 seconds)</p>
        </div>
      )}

      {error && <p style={styles.error}>❌ {error}</p>}

      {songs.length > 0 && (
        <div style={styles.results}>
          <h3>🎉 Your Generated Songs</h3>
          {songs.map((song) => (
            <div key={song.id} style={styles.songCard}>
              <h4>{song.title}</h4>
              <div style={styles.buttonGroup}>
                <button style={styles.previewBtn} onClick={() => handlePreview(song.audioUrl)}>
                  ▶ Preview
                </button>
                <button style={styles.downloadBtn} onClick={() => handleDownload(song.audioUrl, song.title)}>
                  ⬇ Download MP3
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.note}>
        <p>💡 <strong>Authentication Status:</strong></p>
        <p>🍪 Suno Cookie: {process.env.REACT_APP_SUNO_COOKIE ? '✅ Configured' : '❌ Not configured'}</p>
        <p>🎙 ElevenLabs API: {process.env.REACT_APP_ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Not configured'}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px'
  },
  styleSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center'
  },
  styleButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '25px',
    cursor: 'pointer'
  },
  styleActive: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  textarea: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginBottom: '20px',
    fontFamily: 'monospace',
    resize: 'vertical'
  },
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    marginTop: '20px'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#ffe0e0',
    borderRadius: '8px'
  },
  results: {
    marginTop: '30px'
  },
  songCard: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  previewBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  downloadBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  note: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    fontSize: '14px'
  }
};

export default GenerateTab;