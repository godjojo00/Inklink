import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    onLogout();
    navigate("/login");
  }, [navigate, onLogout]);

  return null; // Render nothing or a loading spinner
};

export default Logout;
