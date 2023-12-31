// Header.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isLoggedIn, username, role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/logout');
  };

  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold mr-4">
            Inklink
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Always show the "Search" link */}
          <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Search Requests
          </Link>
          <Link to="/searchBooks" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Search Books
          </Link>

          {/* Show additional links if the user is logged in */}
          {isLoggedIn && (
            <>
              <Link to="/purchaserecord" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Purchase Record
              </Link>
              <Link to="/myRequests" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                My Requests
              </Link>
              <Link to="/myResponses" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                My Responses
              </Link>
              <Link to="/owns" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                My Books
              </Link>
              <Link to="/postrequest" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Post Requests
              </Link>
              <Link to="/rating" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Rating
              </Link>

              {/* Show admin-only links */}
              {/* {role === 'admin' && (
                <>
                  <Link to="/analyzeSells" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                    Analyze Sells
                  </Link>
                  <Link to="/analyzeExchanges" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                    Analyze Exchanges
                  </Link>
                  <Link to="/createbook" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                    Add Books
                  </Link>
                </>
              )} */}
            </>
          )}

          {/* Show login or user info based on login status */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{username}</span>
              <button
                onClick={handleLogoutClick}
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
