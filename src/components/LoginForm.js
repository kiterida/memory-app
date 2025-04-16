import React, { useState } from 'react';
import { TextField, Button, Grid, Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // For using theme styles
import { supabase } from './supabaseClient';

export default function LoginForm(onLogin ) {
  const theme = useTheme();  // Access the theme to use dark colors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    // Add your login logic here
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      console.log(error.message);
    } else {
      setError(null);

      console.log("logged in");
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Center the form vertically
        backgroundColor: theme.palette.background.default, // Background color based on dark theme
      }}
    >
      <Paper 
        elevation={4} 
        sx={{
          padding: 4,
          width: 400,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper, // Paper background to match dark theme
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 3, color: theme.palette.text.primary }}>
          Login 1.2
        </Typography>

        <form onSubmit={handleLogin}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  input: {
                    color: theme.palette.text.primary,  // Text color based on theme
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  input: {
                    color: theme.palette.text.primary,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button 
                variant="contained" 
                type="submit" 
                fullWidth
                sx={{
                  backgroundColor: theme.palette.primary.main, // Primary button color
                  color: theme.palette.primary.contrastText, // Button text color
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark, // Hover effect
                  },
                }}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
