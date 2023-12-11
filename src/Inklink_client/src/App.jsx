import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignUp_Page from './pages/signUp_page';
import Login_Page from './pages/login';
import Owns from './pages/owns';
import PostRequest from './pages/postrequest';
import Header from './component/header';
import { UserProvider } from './Usercontext';
import ExchangePage from './pages/exchangePage';
import SellRequestDetail from './pages/sellrequestdetail';
import RatingPage from './pages/rating';
import SearchPage from './pages/search'; 
import PurchaseRecord from './pages/purchaseRecord';
import MyReqeusts from './pages/myRequests';

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  const handleLogin = (user) => {
    setUsername(user.username);
    setLoggedIn(true);
    setUserId(user.userId);
  };

  const handleLogout = () => {
    setUsername("");
    setLoggedIn(false);
    setUserId("");
  };

  return (
    <Router>
      <UserProvider>
        <div>
          <Header isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
          <Routes>
            <Route element={<Home />} path="/" />
            <Route path="/exchange/:requestId" element={<ExchangePage />} />
            <Route element={<SignUp_Page onLogin={handleLogin} />} path="/signUp" />
            <Route element={<Login_Page onLogin={handleLogin} />} path="/login" />
            <Route element={<Owns />} path="/owns" />
            <Route element={<PostRequest />} path="/postrequest" />
            <Route element={<ExchangePage />} path='/exchange' />
            <Route path='/sell/:requestId' element={<SellRequestDetail />} />
            <Route element={<RatingPage />} path="/rating" />
            <Route element={<SearchPage />} path="/search" />
            <Route element={<PurchaseRecord />} path="/purchaserecord" />
            <Route element={<MyReqeusts />} path="/myRequests" />
          </Routes>
        </div>
      </UserProvider>

    </Router>
  );
}

export default App;
