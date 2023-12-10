// 在 Header 元件中添加 "評分" 連結
import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isLoggedIn, username, onLogout }) => {
  return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold mr-4">
          Inklink
        </Link>
      </div>
      <div className="flex items-center">
        <Link to="/owns" className="mr-4">
          我的藏書
        </Link>
        <Link to="/search" className="mr-4">搜尋</Link> 
        <Link to="/postrequest" className="mr-4">發文</Link>
        <Link to="/rating" className="mr-4">評分</Link> {/* 新增評分連結 */}
        {isLoggedIn ? (
          <>
            <span className="mr-4">{username}</span>
            <button onClick={onLogout} className="text-blue-600 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">登入</Link>
        )}
      </div>
    </div>
  );
};

export default Header;
