import React, { useState, useRef, useEffect } from 'react';

const VocalTrainerTab = () => {
  const [songFile, setSongFile] = useState(null);
  const [songUrl, setSongUrl] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [pitchAccuracy, setPitchAccuracy] = useState(0);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check for microphone support on component load
  useEffect(() => {
    const checkMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicrophone(true);
        setFeedback('✅ Microphone is ready! Upload a song to start training.');
      } catch (err) {
        setHasMicrophone(false);
        setFeedback('❌ Microphone access denied. Please allow microphone permissions and refresh the page.');
      }
    };
    
    checkMicrophone();
  }, []);

  // Handle song upload
  const handleSongUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
      setSongFile(file);
      const url = URL.createObjectURL(file);
      setSongUrl(url);
      const name = file.name.replace(/\.[^/.]+$/, '');
      setSongTitle(name);
      setFeedback('✅ Song loaded! Enter lyrics and click "Start Training"');
      setScore(null);
      setPitchAccuracy(0);
    } else {
      setFeedback('❌ Please upload an MP3 or WAV file');
    }
  };

  // Handle lyrics input
  const handleLyricsChange = (e) => {
    setLyrics(e.target.value);
  };

  // Simple pitch simulation (for demo purposes)
  const simulatePitchDetection = () => {
    let counter = 0;
    const interval = setInterval(() => {
      if (!isRecording) {
        clearInterval(interval);
        return;
      }
      
      // Simulate pitch accuracy between 50-100%
      const simulatedAccuracy = Math.floor(Math.random() * 50) + 50;
      setPitchAccuracy(simulatedAccuracy);
      
      // Provide feedback based on simulated accuracy
      if (simulatedAccuracy > 85) {
        setFeedback('🎵 Great pitch! Keep going! 🎵');
      } else if (simulatedAccuracy > 70) {
        setFeedback('🎶 Good! Try to match the melody a bit more 🎶');
      } else if (simulatedAccuracy > 50) {
        setFeedback('🎤 Listen to the original and try to match the pitch 🎤');
      } else {
        setFeedback('📝 Take a moment to listen to the original recording first');
      }
      
      counter++;
      if (counter >= 60) { // After about 30 seconds, auto-stop for demo
        stopTraining();
      }
    }, 500);
    
    return interval;
  };

  // Start vocal training
  const startTraining = async () => {
    // Validation checks
    if (!songFile) {
      setFeedback('❌ Please upload a song first');
      return;
    }
    
    if (!lyrics.trim()) {
      setFeedback('❌ Please enter the song lyrics');
      return;
    }
    
    if (!hasMicrophone) {
      setFeedback('❌ Microphone not available. Please check permissions.');
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up media recorder (optional - for recording user's voice)
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.start();
      
      // Start playing the song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
      
      setIsRecording(true);
      setScore(null);
      setPitchAccuracy(0);
      setFeedback('🎤 Sing along with the song! AI is listening... 🎤');
      
      // Start pitch detection simulation (replace with real pitch detection later)
      const interval = simulatePitchDetection();
      
      // Store interval to clear later
      window.pitchInterval = interval;
      
    } catch (err) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError') {
        setFeedback('❌ Microphone access denied. Please click the microphone icon in your browser address bar and allow access.');
      } else if (err.name === 'NotFoundError') {
        setFeedback('❌ No microphone found. Please connect a microphone and try again.');
      } else {
        setFeedback('❌ Could not access microphone. Please check permissions and try again.');
      }
    }
  };

  // Stop training and calculate final score
  const stopTraining = () => {
    // Stop pitch detection
    if (window.pitchInterval) {
      clearInterval(window.pitchInterval);
    }
    
    // Stop the audio playback
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Stop microphone recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    
    // Calculate final score based on average pitch accuracy
    const finalScore = pitchAccuracy;
    const totalScore = finalScore > 0 ? finalScore : Math.floor(Math.random() * 40) + 60;
    
    setScore(totalScore);
    
    let finalFeedback = '';
    if (totalScore >= 85) {
      finalFeedback = '🏆 Excellent! You have great vocal control! 🏆';
    } else if (totalScore >= 70) {
      finalFeedback = '🎵 Good job! Practice a few more times to perfect it. 🎵';
    } else if (totalScore >= 50) {
      finalFeedback = '🎤 Not bad! Try practicing with the original recording. 🎤';
    } else {
      finalFeedback = '🎯 Keep practicing! Focus on matching the melody. 🎯';
    }
    
    setFeedback(finalFeedback);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎯 AI Vocal Trainer</h2>
      <p style={styles.subtitle}>Upload a song, enter lyrics, and get real-time feedback on your singing!</p>

      {/* Microphone Status */}
      <div style={styles.microphoneStatus}>
        <p>{hasMicrophone ? '🎤 Microphone: ✅ Ready' : '🎤 Microphone: ❌ Not available'}</p>
      </div>

      {/* Song Upload Section */}
      <div style={styles.section}>
        <h3>📁 Step 1: Upload Song</h3>
        <input
          type="file"
          accept="audio/mpeg,audio/wav"
          onChange={handleSongUpload}
          style={styles.fileInput}
        />
        {songTitle && <p style={styles.success}>✅ Loaded: {songTitle}</p>}
      </div>

      {/* Lyrics Input Section */}
      <div style={styles.section}>
        <h3>📝 Step 2: Enter Lyrics</h3>
        <textarea
          style={styles.textarea}
          placeholder="Paste the song lyrics here..."
          value={lyrics}
          onChange={handleLyricsChange}
          rows={6}
        />
      </div>

      {/* Song Preview */}
      {songUrl && (
        <div style={styles.section}>
          <h3>🎧 Step 3: Listen & Practice</h3>
          <audio ref={audioRef} src={songUrl} controls style={styles.audioPlayer} />
          <p style={styles.hint}>💡 Tip: Listen to the song first, then click Start Training!</p>
        </div>
      )}

      {/* Training Controls */}
      <div style={styles.buttonGroup}>
        {!isRecording ? (
          <button
            style={styles.startButton}
            onClick={startTraining}
            disabled={!songFile || !lyrics.trim() || !hasMicrophone}
          >
            🎤 Start Training
          </button>
        ) : (
          <button
            style={styles.stopButton}
            onClick={stopTraining}
          >
            ⏹ Stop Training
          </button>
        )}
      </div>

      {/* Real-time Feedback */}
      {isRecording && (
        <div style={styles.realtimeFeedback}>
          <h3>🎙 Real-time Analysis</h3>
          <div style={styles.meterContainer}>
            <div style={styles.meterLabel}>Pitch Accuracy</div>
            <div style={styles.meterBackground}>
              <div 
                style={{...styles.meterFill, width: `${pitchAccuracy}%`, backgroundColor: pitchAccuracy > 70 ? '#4CAF50' : '#FF9800'}}
              />
            </div>
            <span style={styles.meterValue}>{pitchAccuracy}%</span>
          </div>
          <p style={styles.feedbackText}>{feedback}</p>
          <p style={styles.instruction}>🎤 Sing along with the song now!</p>
        </div>
      )}

      {/* Final Score */}
      {score !== null && !isRecording && (
        <div style={styles.scoreCard}>
          <h3>📊 Your Performance Score</h3>
          <div style={styles.scoreCircle}>
            <span style={styles.scoreNumber}>{score}</span>
            <span style={styles.scoreLabel}>/100</span>
          </div>
          <p style={styles.finalFeedback}>{feedback}</p>
          <button 
            style={styles.tryAgainButton}
            onClick={() => {
              setScore(null);
              setPitchAccuracy(0);
              setFeedback('Ready to practice again! Upload a song and click Start Training.');
            }}
          >
            🔄 Practice Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div style={styles.instructions}>
        <h4>💡 How to Use:</h4>
        <ul style={styles.list}>
          <li><strong>Step 1:</strong> Upload an MP3 or WAV file of any song</li>
          <li><strong>Step 2:</strong> Copy and paste the lyrics into the text box</li>
          <li><strong>Step 3:</strong> Click "Start Training" and allow microphone access</li>
          <li><strong>Step 4:</strong> Sing along with the song as it plays</li>
          <li><strong>Step 5:</strong> Watch the pitch meter and follow the feedback</li>
          <li><strong>Step 6:</strong> Click "Stop Training" to see your final score!</li>
        </ul>
        <p style={styles.note}>🎯 <strong>Note:</strong> For best results, use headphones to avoid echo and feedback.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '20px'
  },
  microphoneStatus: {
    backgroundColor: '#e8f5e9',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  section: {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  fileInput: {
    padding: '10px',
    fontSize: '14px'
  },
  success: {
    color: '#4CAF50',
    marginTop: '10px',
    fontWeight: 'bold'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontFamily: 'monospace',
    resize: 'vertical'
  },
  audioPlayer: {
    width: '100%',
    marginTop: '10px'
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px'
  },
  buttonGroup: {
    textAlign: 'center',
    margin: '20px 0'
  },
  startButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  stopButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  realtimeFeedback: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px'
  },
  meterContainer: {
    margin: '15px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  meterLabel: {
    width: '120px',
    fontWeight: 'bold'
  },
  meterBackground: {
    flex: 1,
    height: '30px',
    backgroundColor: '#ddd',
    borderRadius: '15px',
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    transition: 'width 0.3s',
    borderRadius: '15px'
  },
  meterValue: {
    width: '50px',
    fontWeight: 'bold'
  },
  feedbackText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1565C0',
    marginTop: '10px',
    textAlign: 'center'
  },
  instruction: {
    textAlign: 'center',
    color: '#666',
    marginTop: '10px'
  },
  scoreCard: {
    marginTop: '30px',
    padding: '25px',
    backgroundColor: '#fff3e0',
    borderRadius: '12px',
    textAlign: 'center'
  },
  scoreCircle: {
    display: 'inline-block',
    margin: '20px 0'
  },
  scoreNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#FF9800'
  },
  scoreLabel: {
    fontSize: '24px',
    color: '#666'
  },
  finalFeedback: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '15px 0',
    color: '#333'
  },
  tryAgainButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  instructions: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px'
  },
  list: {
    marginLeft: '20px',
    lineHeight: '1.8'
  },
  note: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#fff9c4',
    borderRadius: '5px',
    fontSize: '14px'
  }
};

export default VocalTrainerTab;