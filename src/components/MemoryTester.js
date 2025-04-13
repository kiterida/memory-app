import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TextField, Switch, Button, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import { supabase } from './supabaseClient';
import MemoryToolbar from './MemoryToolbar';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));



const label = { inputProps: { 'aria-label': 'Switch demo' } };

export default function MemoryTester() {
  const [memoryIndex, setMemoryIndex] = useState('');
  const [memoryItems, setMemoryItems] = useState([]);
  const [showFields, setShowFields] = useState(true); // Toggle for field visibility
  const [currentMemoryName, setCurrentMemoryName] = useState('');
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0); // Track the index of the current memory item
  const [audioOn, setAudioOn] = useState(false);
  const [isPlaying, setIsPlayingl] = useState(false);
  const [shouldVocalise, setShouldVocalise] = useState(false);
  
  const vocalisePromiseRef = useRef(null); // To track the promise that resolves when speech ends
  const speechInProgress = useRef(false); // To prevent starting a new speech while one is in progress

  const handleSwitchChange = () => {
    console.log("handleSwitchChange");
    setShowFields((prev) => !prev); // Toggle field visibility
  };
  const handleMemoryIndexChange = async (event) => {
    const newValue = event.target.value;
    setMemoryIndex(newValue);
    console.log("Memory Index:", newValue);

    if (newValue) {
      try {
        // First query: get the root memory item with parent_id null and matching memory_key
        const { data: rootData, error: rootError } = await supabase
          .from('memory_items')
          .select('*')
          .is('parent_id', null)
          .eq('memory_key', parseInt(newValue))
          .single(); // We expect a single row

          console.log("handleMemoryIndexChange memory_key", newValue);

        if (rootError) {
          console.error("Error fetching root memory item:", rootError.message);
          return;
        }

        console.log("Root Memory Item:", rootData);
        setCurrentMemoryName(rootData.name);

        if (rootData) {
          // Second query: get child memory items ordered by memory_key where parent_id equals the id of the root row
          const { data: childData, error: childError } = await supabase
            .from('memory_items')
            .select('*')
            .eq('parent_id', rootData.id)
            .order('memory_key', { ascending: true }); // Order by memory_key ascending

          if (childError) {
            console.error("Error fetching child memory items:", childError.message);
          } else {
            setMemoryItems(childData || []);
            console.log("Ordered Child Memory Items:", childData);
          }
        } else {
          setMemoryItems([]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    } else {
      setMemoryItems([]);
    }
  };

  // Ensure speech synthesis queue is clear
// window.speechSynthesis.cancel();

  function speak(text) {
   
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Set the language
    utterance.volume = 1; // Set volume (0.0 to 1.0)
    utterance.rate = 1.0; // Increase rate for faster speech
    utterance.pitch = 1; // Set pitch (default is 1)

    // Use the first available voice as a default
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        utterance.voice = voices[0];
    }

    // Speak the text
    window.speechSynthesis.speak(utterance);
}


  const onToggleAudioOn = () => {
    setAudioOn(!audioOn);
    console.log('recieved toggle');
  }

  const onPlayStateChange = (playing) => {
    console.log("Recieved play state change from toolbar: ", playing)
  }

  
  const vocalise = useCallback((memIndex) => {
    return new Promise((resolve) => {
      if (!audioOn) return resolve();
  
      const currentMemoryItem = memoryItems[memIndex] || {};
      const sayThis = `${currentMemoryItem.memory_key}, ${currentMemoryItem.name}`;
  
      console.log("Say this", sayThis);
      console.log("🔊 Starting speech...");
  
      const utterance = new SpeechSynthesisUtterance(sayThis);
  
      utterance.onend = () => {
        console.log("✅ Speech ended");
        resolve();
      };
  
      utterance.onerror = (e) => {
        console.error("❌ Speech error:", e);
        resolve(); // Still resolve to avoid blocking
      };
  
      window.speechSynthesis.speak(utterance);
    });
  }, [audioOn, memoryItems]); // Make sure memoryItems and audioOn are stable
  
  const handleNextMemoryItem = useCallback(async () => {
    const nextIndex = (currentMemoryIndex + 1) % memoryItems.length;
    await vocalise(nextIndex); // Wait for speech first
    setCurrentMemoryIndex(nextIndex); // Then move to next
  }, [currentMemoryIndex, memoryItems, vocalise]);
  
  

  const handlePreviousMemoryItem = () => {
    setCurrentMemoryIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      if (nextIndex >= memoryItems.length) {
        return 0; // Loop back to the first item if it's the last one
      }
      return nextIndex;
    });
  };

  const currentMemoryItem = memoryItems[currentMemoryIndex] || {}; // Current item to display

  return (

    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid container spacing={2}>
        
        { /* conditional rendering */ }
        {showFields && ( <Grid size={{ xs: 12, md: 6 }}>
         
         <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
           <TextField
             id="memoryIndexTextField"
             label="Memory Index"
             variant="outlined"
             value={memoryIndex}
             onChange={handleMemoryIndexChange}
             fullWidth
           />
         </Box>
       </Grid>)}
      

          {showFields && (
          <Grid size={{ xs: 12, md: 6 }}>
          
              <Box sx={{ display: 'flex' }}>
                <TextField
                  id="memoryNameField"
                  label="Memory Name"
                  variant="outlined"
                  value={currentMemoryName}
                  onChange={(event) => setCurrentMemoryName(event.target.value)}
                  fullWidth
                />
              </Box>
         
          </Grid>
          )}


          <Grid size={{ xs: 12, md: 12 }}>
            <Item sx={{ height: "160px" }}>
              {memoryItems.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <div>
                    <strong>{currentMemoryItem.memory_key}</strong> - {currentMemoryItem.name}
                  </div>
                  <Button
                    variant="contained"
                    onClick={handleNextMemoryItem}
                    sx={{
                      display: 'default',
                      marginTop: 'auto',
                      width: '100%',
                    }}
                  >
                    Next
                  </Button>
                </Box>

              ) : (
                <div>No memory items found</div>
              )}
            </Item>
          </Grid>
            
          <Grid size={{ xs: 12}}>
          <MemoryToolbar
            toolBarProgress={currentMemoryIndex}      // number for the progress bar
            toolBarRange={memoryItems.length}
            // isPlaying={isPlaying}                  // boolean to determine play/pause icon
            // onTogglePlay={handleTogglePlay}        // function to handle play/pause toggle
            onNext={handleNextMemoryItem}             // function to go to the next item
            onBack={handlePreviousMemoryItem}         // function to go back
            onHandleSwitch={handleSwitchChange}
            onToggleAudio={onToggleAudioOn}
            onPlayChange={onPlayStateChange}
          />
          </Grid>
          <Grid item xs={12}>
            <Item>Put more stuff here</Item>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
