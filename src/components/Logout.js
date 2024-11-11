import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ handleLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Call the logout function and redirect to login or home page
    handleLogout();
    console.log("Logged Out");
    // navigate('/login'); // Redirect to login page after logout
  }, [handleLogout, navigate]);

  return null; // This component does not render anything visible
};

export default Logout;
