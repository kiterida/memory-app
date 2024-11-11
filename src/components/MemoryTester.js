import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { supabase } from './supabaseClient';

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

export default function MemoryTester() {
  const [memoryIndex, setMemoryIndex] = useState('');
  const [memoryItems, setMemoryItems] = useState([]);
  const [currentMemoryName, setCurrentMemoryName] = useState('');
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0); // Track the index of the current memory item

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
          .eq('memory_key', newValue)
          .single(); // We expect a single row
  
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
  

  const handleNextMemoryItem = () => {
    setCurrentMemoryIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
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
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Item>
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
            </Item>
          </Grid>

          <Grid item xs={6}>
            <Item>
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
            </Item>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Item>
            {memoryItems.length > 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div>
                  <strong>{currentMemoryItem.memory_key}</strong> - {currentMemoryItem.name}
                </div>
                <Button variant="contained" onClick={handleNextMemoryItem} sx={{ marginLeft: 2 }}>
                  Next
                </Button>
              </Box>
            ) : (
              <div>No memory items found</div>
            )}
          </Item>
        </Grid>

        <Grid item xs={12}>
          <Item>Put more stuff here</Item>
        </Grid>
      </Grid>
    </Box>
  );
}
