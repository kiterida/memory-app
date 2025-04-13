import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Tooltip from '@mui/material/Tooltip';

const ItemToolbar = ({ onBack, onForward, onSave, onDelete }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Tooltip title="Go Back">
          <IconButton edge="start" onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Go Forward">
          <IconButton onClick={onForward}>
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save">
          <IconButton onClick={onSave}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default ItemToolbar;
