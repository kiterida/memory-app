import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './components/supabaseClient';
import { Button, TextField, Typography, Box } from '@mui/material';
import MUITreeView from './components/MUITreeView';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ApiMethodSetItemExpansion from './components/SampleTree';
import PersistentDrawerLeft from './components/PersistentDrawerLeft'
import LoginForm from './components/LoginForm'

// Import necessary components from React Router
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
    // Get the session to determine if the user is logged in
    const checkUserSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        console.log('User already logged in:', sessionData.session.user);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkUserSession();

    // Set up a listener to track auth state changes (e.g., after login or logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    console.log("loggin out");
  
    await supabase.auth.signOut();
    setIsLoggedIn(false);
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
    <div>
      {isLoggedIn ? (
    <Router>
    <Routes>
      <Route path="/*" element={<PersistentDrawerLeft handleLogout={handleLogout}/>} />
    </Routes>
  </Router>
       ) : (
        <LoginForm onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>

    
  );
}

export default App;
