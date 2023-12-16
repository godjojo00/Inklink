import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Usercontext';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();
  const { clearUserData } = useUser();

  useEffect(() => {
    onLogout();
    clearUserData();
    localStorage.removeItem('token');
    navigate("/login");
  }, [navigate, onLogout, clearUserData]);

  return null; // Render nothing or a loading spinner
};

export default Logout;
