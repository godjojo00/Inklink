import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignUp_Page from './pages/signUp_page';
import Login_Page from './pages/login';
import Owns from './pages/owns';
import PostRequest from './pages/postrequest';
import Header from './component/header';
import HeaderAdmin from './component/headerAdmin';
import { UserProvider } from './Usercontext';
import ExchangePage from './pages/exchangePage';
import SellRequestDetail from './pages/sellrequestdetail';
import RatingPage from './pages/rating';
import SearchPage from './pages/search';

import PurchaseRecord from './pages/purchaseRecord';
import SearchBooks from './pages/searchBooks';
import MyReqeusts from './pages/myRequests';
import Logout from './pages/logout';
import HomeAdmin from './pages/HomeAdmin';
import SellAnalysisPage from './pages/analsell';
import ExchangeAnalysisPage from './pages/analexchange';
import CreateBookForm from './pages/createbook';
import MyResponses from './pages/myResponses';

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  const handleLogin = (user) => {
    setUsername(user.username);
    setRole(user.role);
    setLoggedIn(true);
    setUserId(user.userId);
  };

  const handleLogout = () => {
    setUsername("");
    setRole("");
    setLoggedIn(false);
    setUserId("");
  };

  return (
    <Router>
      <UserProvider>
        <div>
          {role === 'admin' ? (
            <HeaderAdmin isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
          ) : (
            <Header isLoggedIn={isLoggedIn} username={username} role={role} onLogout={handleLogout} />
          )}
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exchange/:requestId" element={<ExchangePage />} />
            <Route path="/signUp" element={<SignUp_Page onLogin={handleLogin} />} />
            <Route path="/login" element={<Login_Page onLogin={handleLogin} />} />
            <Route path="/admin" element={<HomeAdmin onLogin={handleLogin} />} />
            <Route path="/owns" element={<Owns />} />
            <Route path="/postrequest" element={<PostRequest />} />
            <Route path="/exchange" element={<ExchangePage />} />
            <Route path="/sell/:requestId" element={<SellRequestDetail />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/searchBooks" element={<SearchBooks />} />
            <Route path="/purchaserecord" element={<PurchaseRecord />} />
            <Route path="/myRequests" element={<MyReqeusts />} />
            <Route element={<MyResponses />} path="/myResponses" />
            <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
            <Route path="/analsell" element={<SellAnalysisPage />} />
            <Route path="/analexchange" element={<ExchangeAnalysisPage />} />
            <Route path="/createbook" element={<CreateBookForm />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
