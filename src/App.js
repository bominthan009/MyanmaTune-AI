import React, { useState } from 'react';
import GenerateTab from './components/GenerateTab';
import VocalTrainerTab from './components/VocalTrainerTab';

function App() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="App">
      <header style={styles.header}>
        <h1>🎵 MyanmaTune-AI Studio</h1>
        <p>Generate Music + Studio Editing + Karaoke + Vocal Trainer</p>
      </header>

      <div style={styles.tabBar}>
        <button 
          style={activeTab === 'generate' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('generate')}
        >
          🎤 Generate
        </button>
        <button 
          style={activeTab === 'studio' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('studio')}
        >
          🎛 Studio
        </button>
        <button 
          style={activeTab === 'karaoke' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('karaoke')}
        >
          🎙 Karaoke
        </button>
        <button 
          style={activeTab === 'trainer' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('trainer')}
        >
          🎯 Vocal Trainer
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'generate' && <GenerateTab />}
        {activeTab === 'studio' && <div style={styles.comingSoon}>🎛 Studio Editor (Coming Soon)</div>}
        {activeTab === 'karaoke' && <div style={styles.comingSoon}>🎙 Karaoke Maker (Coming Soon)</div>}
        {activeTab === 'trainer' && <VocalTrainerTab />}
      </div>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#282c34',
    padding: '20px',
    color: 'white',
    textAlign: 'center'
  },
  tabBar: {
    display: 'flex',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f5f5f5'
  },
  tab: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  activeTab: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  content: {
    padding: '20px',
    minHeight: '400px'
  },
  comingSoon: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666'
  }
};

export default App;