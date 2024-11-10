import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './components/supabaseClient';
import { Button, TextField, Typography, Box } from '@mui/material';
import MUITreeView from './components/MUITreeView';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ApiMethodSetItemExpansion from './components/SampleTree';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);


   // Debounce function
   const debounce = (func, delay) => {
    let debounceTimeout;
    return (...args) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => func(...args), delay);
    };
  };

  // This section is going to connect to the memory_list table and display the data in a treeview
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
      fetchMemoryTree();
  }, []);

  const fetchMemoryTree = async () => {
    const { data, error } = await supabase.rpc('fetch_memory_tree');

    if (error) {
        console.error("Error fetching memory tree:", error);
        return;
    }

    // Convert flat data to nested structure
    const dataMap = {};
    data.forEach((item) => {
        dataMap[item.id] = { ...item, children: [] };
    });

    const nestedData = [];
    data.forEach((item) => {
        if (item.parent_id === null) {
            nestedData.push(dataMap[item.id]);
        } else if (dataMap[item.parent_id]) {
            dataMap[item.parent_id].children.push(dataMap[item.id]);
        }
    });

    setTreeData(nestedData);
};

const handleDropUpdate = async (draggedItemId, newParentId) => {
  try {
    console.log("handleDropUpdate called with:", { draggedItemId, newParentId });

    if (draggedItemId === newParentId) {
      console.error("Cannot drop an item onto itself.");
      return;
    }

    // Update the parent_id of the dragged item in the memory_items table
    const { error } = await supabase
      .from('memory_items')
      .update({ parent_id: newParentId })
      .eq('id', draggedItemId);

    if (error) throw error;

    console.log("Item successfully updated.");
  } catch (err) {
    console.error("Error updating item:", err);
  }

  fetchMemoryTree();

  
};

  // Fetch all notes (Read operation)
  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('memory_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching notes:', error.message);
    else setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create a new note
  const createNote = async () => {
    const { data, error } = await supabase
      .from('memory_notes')
      .insert([{ title: 'New Note', content: noteContent }]);
    if (error) console.error('Error creating note:', error.message);
    else {
      setNoteContent(''); // Clear the input field
      fetchNotes(); // Refresh the notes list
    }
  };

  // Update an existing note (selectedNoteId should be set first)
  const updateNote = async () => {
    if (!selectedNoteId) return alert('Select a note to update.');
    const { data, error } = await supabase
      .from('memory_notes')
      .update({ content: noteContent })
      .eq('id', selectedNoteId);
    if (error) console.error('Error updating note:', error.message);
    else fetchNotes(); // Refresh the notes list
  };

  // Delete a note (selectedNoteId should be set first)
  const deleteNote = async () => {
    if (!selectedNoteId) return alert('Select a note to delete.');
    const { data, error } = await supabase
      .from('memory_notes')
      .delete()
      .eq('id', selectedNoteId);
    if (error) console.error('Error deleting note:', error.message);
    else fetchNotes(); // Refresh the notes list
  };


 
    


  return (
    <DndProvider backend={HTML5Backend}>
    <div>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Memory Notes</Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Note Content"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            variant="outlined"
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button variant="contained" onClick={createNote} color="primary">Create Note</Button>
          <Button variant="contained" onClick={fetchNotes} color="info">Read Notes</Button>
          <Button variant="contained" onClick={updateNote} color="warning">Update Note</Button>
          <Button variant="contained" onClick={deleteNote} color="error">Delete Note</Button>
        </Box>

       
        <MUITreeView />

      
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box>
            {notes.length > 0 ? (
              notes.map((note) => (
                <Box
                  key={note.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedNoteId === note.id ? '#f0f0f0' : 'white',
                  }}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setNoteContent(note.content);
                  }}
                >
                  <Typography variant="h6">{note.title}</Typography>
                  <Typography variant="body1">{note.content}</Typography>
                  <Typography variant="caption">{note.created_at}</Typography>
                </Box>
              ))
            ) : (
              <Typography>No notes found.</Typography>
            )}
          </Box>
        )}
      </Box>
    </div>
    </DndProvider>
  );
}

export default App;
