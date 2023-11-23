import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookExchange from './pages/bookexchange';
import Home from './pages/Home';
import IdVerify from './pages/IdVerify';
import QuestionForm from './pages/questionform';
import SignUp_Page from './pages/signUp_page';
import Login from './pages/login';
import Owns from './pages/owns';
import Header from './component/header';

function App() {
  const [user, setUser] = useState(null); // 使用狀態來管理用戶

  const handleLogin = (userData) => {
    // 登入後的處理邏輯，設置用戶狀態等
    setUser(userData);
  };

  const handleLogout = () => {
    // 登出後的處理邏輯，清除用戶狀態等
    setUser(null);
  };

  return (
    <Router>
      <div>
        <Header user={user} onLogout={handleLogout} /> {/* 將用戶數據和登出函數傳遞給 Header */}
        <Routes>
          {/* 在每個 Route 下渲染相同的 Header */}
          <Route
            path="/*"
            element={
              <Routes>
                <Route element={<Home />} path="/" />
                <Route element={<BookExchange />} path="/book-exchange" />
                <Route element={<QuestionForm />} path="/questionform" />
                <Route
                  element={<SignUp_Page onLogin={handleLogin} />}
                  path="/signUp"
                />
                <Route
                  element={<Login onLogin={handleLogin} />}
                  path="/login"
                />
                <Route element={<IdVerify />} path="/Id" />
                <Route element={<Owns />} path="/owns" />
              </Routes>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
