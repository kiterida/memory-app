import React, { useState, useEffect } from 'react';
import {
  Box,
  Switch,
  Tooltip,
  LinearProgress,
  Typography,
  ButtonGroup,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import PropTypes from 'prop-types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TimerIcon from '@mui/icons-material/Timer';

function LinearProgressWithLabel(props) {
    const progressCount = props.itemCount || 1; // Default to 1 if itemCount is 0 or undefined
    const progressConverted = (props.value / progressCount) * 100;
  
    console.log("Progress converted:", progressConverted);
    console.log("Props:", props);
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" value={progressConverted} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(progressConverted)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }
  

LinearProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

const MemoryToolbar = ({
  toolBarProgress,
  toolBarRange,
  isPlaying,
  onNext,
  onBack,
  onShowHideToggle,
  showHideValue,
  onHandleSwitch,
}) => {
  const [progress, setProgress] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [timerAnchorEl, setTimerAnchorEl] = useState(null);
  const [timerInterval, setTimerInterval] = useState(5000); // Default to 5 seconds
  const [timerId, setTimerId] = useState(null);
  const [progressCount, setProgressCount] = useState(100);

    console.log("toolBarRange", toolBarRange)

  const onHandleNext = () => {
    onNext();
  };

  const onSwitchChange = () => {
    onHandleSwitch();
  };

  const handleTimerClick = (event) => {
    setTimerAnchorEl(event.currentTarget);
  };

  const handleTimerClose = (interval) => {
    setTimerAnchorEl(null);
    if (interval) {
      setTimerInterval(interval); // Set selected interval
    }
  };

  const handleTogglePlay = () => {
    setPlaying(!playing);
  };

  useEffect(() => {
    if (playing) {
      const id = setInterval(() => {
        onHandleNext();
      }, timerInterval);
      setTimerId(id);
    } else if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [playing, timerInterval]);

  useEffect(() => {
    setProgressCount(progressCount);
    setProgress(toolBarProgress);
  }, [toolBarProgress, toolBarProgress]);

  return (
    <Box sx={{ padding: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      {/* Show/Hide Switch with Tooltip */}
      <Tooltip title="Show/Hide">
        <Switch checked={showHideValue} onChange={onSwitchChange} />
      </Tooltip>

      {/* Button Group for Back, Play/Pause, Next */}
      <ButtonGroup variant="contained" sx={{ marginTop: 1, marginBottom: 1 }}>
        <Button onClick={onBack}>
          <ArrowBackIosNewIcon />
        </Button>
        <Button onClick={handleTogglePlay}>
          {playing ? <PauseIcon /> : <PlayArrowIcon />}
        </Button>
        <Button onClick={onHandleNext}>
          <ArrowForwardIosIcon />
        </Button>
      </ButtonGroup>

      {/* Timer Button */}
      <IconButton onClick={handleTimerClick}>
        <TimerIcon />
      </IconButton>
      <Menu
        anchorEl={timerAnchorEl}
        open={Boolean(timerAnchorEl)}
        onClose={() => handleTimerClose()}
      >
        <MenuItem onClick={() => handleTimerClose(5000)}>5 seconds</MenuItem>
        <MenuItem onClick={() => handleTimerClose(4000)}>4 seconds</MenuItem>
        <MenuItem onClick={() => handleTimerClose(3000)}>3 seconds</MenuItem>
        <MenuItem onClick={() => handleTimerClose(2000)}>2 seconds</MenuItem>
        <MenuItem onClick={() => handleTimerClose(1000)}>1 seconds</MenuItem>
        <MenuItem onClick={() => handleTimerClose(500)}>0.5 seconds</MenuItem>
      </Menu>

      {/* Linear Progress Bar */}
      <Box sx={{ width: '100%', marginTop: 2 }}>
        <LinearProgressWithLabel value={progress} itemCount={toolBarRange} />
      </Box>
    </Box>
  );
};

export default MemoryToolbar;
