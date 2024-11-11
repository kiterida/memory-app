import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
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
  const [currentMemoryName, setCurrentMemoryName] = useState([])

  const handleMemoryIndexChange = async (event) => {
    const newValue = event.target.value;
    setMemoryIndex(newValue);
    console.log("Memory Index:", newValue);
  
    if (newValue) {
      try {
        // First query: get the row with parent_id null and matching memory_key
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
          // Second query: get rows where parent_id equals the id of the root row
          const { data: childData, error: childError } = await supabase
            .from('memory_items')
            .select('*')
            .eq('parent_id', rootData.id);
  
          if (childError) {
            console.error("Error fetching child memory items:", childError.message);
          } else {
            setMemoryItems(childData || []);
            console.log("Child Memory Items:", childData);
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
  
  
  
  

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
      <Grid container spacing={2} alignItems="center">
  <Grid item xs={6}> {/* First text field container */}
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

  <Grid item xs={6}> {/* Second text field container */}
    <Item>
      <Box sx={{ display: 'flex' }}>
        <TextField
          id="memoryNameField"
          label="Memory Name"
          variant="outlined"
          value={currentMemoryName}
          onChange={(event) => {
            setCurrentMemoryName(event.target.value);
          }}
          fullWidth
        />
      </Box>
    </Item>
  </Grid>
</Grid>

        <Grid size={12}>
          <Item>Put more stuff here</Item>
        </Grid>
        <Grid size={12}>
          <Item><Box sx={{display: 'flex', justifyContent: 'flex-start'}}>
            {memoryItems.length > 0 ? (
              memoryItems.map((item) => (
                <Box key={item.id}>
                  <strong>{item.name}</strong> - {item.description}
                </Box>
              ))
            ) : (
              <div>No memory items found</div>
            )}
          </Box></Item>
        </Grid>
        <Grid size={12}>
          <Item>size=4</Item>
        </Grid>
        <Grid size={12}>
          <Item>size=12</Item>
        </Grid>
      </Grid>
    </Box>
  );
}
