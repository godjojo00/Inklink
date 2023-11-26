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
        <Link to="/pages/post" className="mr-4">發文</Link>
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
