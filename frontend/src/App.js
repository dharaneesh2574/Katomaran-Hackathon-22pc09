import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import RegistrationPage from './components/RegistrationPage';
import RecognitionPage from './components/RecognitionPage';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Face Recognition Platform
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Registration
            </Button>
            <Button color="inherit" component={Link} to="/recognition">
              Recognition
            </Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<RegistrationPage />} />
            <Route path="/recognition" element={<RecognitionPage />} />
          </Routes>
        </Container>
      </Router>
    </SocketProvider>
  );
}

export default App;
