import React, { useState } from 'react';
import Registration from './components/Registration';
import Recognition from './components/Recognition';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('registration');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Face Recognition Platform</h1>
        <nav>
          <button
            className={activeTab === 'registration' ? 'active' : ''}
            onClick={() => setActiveTab('registration')}
          >
            Registration
          </button>
          <button
            className={activeTab === 'recognition' ? 'active' : ''}
            onClick={() => setActiveTab('recognition')}
          >
            Recognition
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'registration' ? <Registration /> : <Recognition />}
      </main>
    </div>
  );
}

export default App;
