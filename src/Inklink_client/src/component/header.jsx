import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isLoggedIn, username, onLogout }) => {
  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold mr-4">
            InkLink
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Always show the "Search" link */}
          <Link to="/search" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Search Requests
          </Link>
          <Link to="/searchBooks" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Search Books
          </Link>

          {/* Show additional links if the user is logged in */}
          {isLoggedIn && (
            <>
              <Link to="/purchaserecord" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                訂單記錄
              </Link>
              <Link to="/owns" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                我的藏書
              </Link>
              <Link to="/postrequest" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                發文
              </Link>
              <Link to="/rating" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                評分
              </Link>
            </>
          )}

          {/* Show login or user info based on login status */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{username}</span>
              <button
                onClick={onLogout}
                className="text-blue-600 hover:text-blue-400 focus:outline-none"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              登入
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
