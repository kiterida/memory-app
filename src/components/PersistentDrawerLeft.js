// PersistentDrawerLeft.js

import React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GradingIcon from '@mui/icons-material/Grading';
import SettingsIcon from '@mui/icons-material/Settings';
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving';
import StarIcon from '@mui/icons-material/Star';
import MUITreeView from './MUITreeView';
import MemoryTester from './MemoryTester';
import Logout from './Logout';

const drawerWidth = 240;

// Page Components
const Memories = () => <div><MUITreeView /></div>;
const StarredLists = () => <div><MUITreeView filterStarred={true} /></div>;
const MemoryTesterPage = () => <div><MemoryTester /></div>;
const DeepDive = () => <div>Deep Dive</div>;
const Settings = () => <div>Settings Page</div>;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    display: 'flex',
    overflow: 'auto', // make scrolling possible
    flexDirection: 'column',
    // padding: theme.spacing(2),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? drawerWidth : 0,
  }),
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: `calc(100% - ${open ? drawerWidth : 0}px)`,
    marginLeft: open ? drawerWidth : 0,
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft({ handleLogout }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const menuItems = [
    { text: 'Memories', icon: <PsychologyIcon />, path: '/memories' },
    { text: 'Starred Lists', icon: <StarIcon />, path: '/starredLists'},
    { text: 'Memory Tester', icon: <GradingIcon />, path: '/memoryTesterPage' },
    { text: 'Deep Dive', icon: <ScubaDivingIcon />, path: '/deepDive' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Log Out', icon: <SettingsIcon />, path: '/logout' },
  ];

  const handleClick = (path) => {
    
    if (path === '/logout') {
      handleLogout(); // Trigger logout
      navigate('/login'); // Redirect to login page
    } else {
      navigate(path); // Navigate to other routes
    }

    
  };

  return (
    <Box sx={{ display: 'flex' }} >
      <CssBaseline />
      <AppBar position="fixed" open={open} >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Memory
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        onClick={handleDrawerClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="temporary"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List >
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleClick(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* <Main open={open} sx={{paddingTop: '80px'}}>     */}
      <Main open={open} sx={ { height: `calc(100vh - 56px)`, marginTop: '56px'}}>
        {/* <Box sx={ { height: `calc(100vh - 56px)`, marginTop: '56px'}} /> */}
        <Routes>
          <Route path="/memories" element={<Memories />} />
          <Route path="/starredLists" element={<StarredLists />} />
          <Route path="/memoryTesterPage" element={<MemoryTesterPage />} />
          <Route path="/deepDive" element={<DeepDive />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout handleLogout={handleLogout} />} />
        </Routes>
      </Main>
    </Box>
  );
}
