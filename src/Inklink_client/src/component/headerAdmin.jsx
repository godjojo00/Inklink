// HeaderAdmin.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HeaderAdmin = ({ isLoggedIn, username, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/logout');
  };

  return (
    <div className="bg-yellow-400 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/admin" className="text-2xl font-bold mr-4">
            InkLink Admin+
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Always show the "Search" link */}
          <Link to="/analsell" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Analyze Sells
          </Link>
          <Link to="/analexchange" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Analyze Exchanges
          </Link>
          <Link to="/search" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Search Requests
          </Link>
          <Link to="/searchBooks" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Search Books
          </Link>
          <Link to="/createbook" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Add Books
          </Link>

          {/* Show login or user info based on login status */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-black font-semibold">{username}</span>
              <button
                onClick={handleLogoutClick}
                className="text-white hover:text-blue-400 focus:outline-none"
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

export default HeaderAdmin;
