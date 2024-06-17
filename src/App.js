import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import NavBar from './pages/NavBar/NavBar';

function App() {
  const [loginToggled, setLoginToggled] = useState(false);
  const [accountToggled, setAccountToggled] = useState(false);

  function toggleLogin() {
    setLoginToggled(!loginToggled);
  }

  function hideLogin(e) {
    let leftBound = window.innerWidth - 550;
    let topBound = 85;
    let bottomBound = 85 + 500;
    if (loginToggled && e.target.className !== "Account" && (e.clientX < leftBound || e.clientY < topBound || e.clientY > bottomBound)) {
      setLoginToggled(false);
    }
  }

  function toggleAccount() {
    setAccountToggled(!accountToggled);
  }

  function hideAccount(e) {
    let leftBound = window.innerWidth - 550;
    let topBound = 85;
    let bottomBound = 85 + 500;
    if (accountToggled && e.target.className !== "Account" && (e.clientX < leftBound || e.clientY < topBound || e.clientY > bottomBound)) {
      setAccountToggled(false);
    }
  }

  function hide() {
    setLoginToggled(false);
  }

  function hideAccountPage() {
    setAccountToggled(false);
  }

  useEffect(() => {
    if (loginToggled) document.addEventListener("mousedown", hideLogin);
    else document.removeEventListener("mousedown", hideLogin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginToggled]);

  useEffect(() => {
    if (accountToggled) document.addEventListener("mousedown", hideAccount);
    else document.removeEventListener("mousedown", hideAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountToggled]);

  return (
    <Router>
      <NavBar toggle={toggleLogin} hide={hide} toggled={loginToggled} 
      toggleAccount={toggleAccount} hideAccount={hideAccountPage} accountToggled={accountToggled}/>
      <LandingPage/>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;