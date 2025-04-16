import React, { useRef, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Box, Card, CardContent } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useDrag, useDrop } from 'react-dnd';
import { fetchMemoryTree, updateMemoryItemParent, updateMemoryItem, updateStarred } from './memoryData';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import Stack from '@mui/material/Stack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Star } from '@mui/icons-material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CodeSnippet from './CodeSnippet';
import ItemEditScreen from './ItemEditScreen';
import ItemDetailsTab from './ItemDetailsTab';
import DraggableTreeItem from './DraggableTreeItem';
import ItemToolbar from './ItemToolbar';
import Fab from '@mui/material/Fab';

const ITEM_TYPE = 'TREE_ITEM';

const MUITreeView = ({ filterStarred }) => {
  const [treeData, setTreeData] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null); // Track the expanded item
  const [selectedItem, setSelectedItem] = useState(null);

  const [width, setWidth] = useState(300); // Initial width of the box
  const resizing = useRef(false); // Track resizing state
  const boxRef = useRef();
  const offset = useRef(0); // Offset between mouse and border



  // console.log('filterStarred = ', filterStarred)
  const apiRef = useTreeViewApiRef();

  // Function to expand the newly created parent item
  const ExpandNewlyCreatedParent = () => {
    console.log("ExpandNewlyCreatedParent");

    // Check if expandedItemId is set
    if (expandedItemId) {
      console.log("Expanding item with id ", expandedItemId);
      apiRef.current.setItemExpansion(null, String(expandedItemId), true); // Expand the item
    }
  };

  const handleCollapseClick = (event) => {
    apiRef.current.setItemExpansion(event, '42', false);
  };


  const getTreeData = async () => {
    console.log("Fetching tree data...");
    const data = await fetchMemoryTree();
    console.log("Tree data length = ", data.length)

    setTreeData(data);
    console.log("data = ", data);
    console.log("Tree data fetched");
  };

  useEffect(() => {
    // Fetch the tree data when the component is mounted
    getTreeData();
  }, []); // Empty dependency array ensures this runs only once

  // UseEffect to call ExpandNewlyCreatedParent when data is ready and expandedItemId is set
  useEffect(() => {
    if (expandedItemId && treeData.length > 0) {
      ExpandNewlyCreatedParent(); // Call function to expand the parent after data is fetched
    }
  }, [expandedItemId, treeData]); // Runs when either treeData or expandedItemId changes

  // Handle mouse events for resizing
  const handleMouseDown = (e) => {
    // Start resizing when clicking near the scrollbar

    if (e.target === boxRef.current) {
      //  console.log('handleMouseDown');
      resizing.current = true;
      offset.current = e.clientX - width;
      document.body.style.cursor = 'col-resize'; // Set cursor during resizing
    }
  };

  const handleMouseMove = (e) => {
    // console.log('handleMouseMove start');
    if (resizing.current) {
      // const newWidth = e.clientX; // Adjust width based on mouse position
      const newWidth = e.clientX - offset.current;
      console.log('handleMouseMove', e.clientX);
      // setWidth(Math.max(300, Math.min(newWidth, 600))); // Clamp between min and max
      setWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    resizing.current = false; // Stop resizing
    document.body.style.cursor = 'default'; // Reset cursor after resizing
  };

  // Attach mousemove and mouseup listeners to the document
  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const mapTreeData = (data, isRoot = true) => {
    const result = ((isRoot && filterStarred) ? data.filter((item) => item.starred !== false) : data) // Apply filter only at root level
      .map((item) => (
        <DraggableTreeItem
          key={item.id}
          item={item}
          itemId={item.id}
          onDropUpdate={handleDropUpdate}
          onSelectItem={setSelectedItem}
          onCreateNewChild={handleCreateNewChild}
        >
          {item.children && item.children.length > 0 ? mapTreeData(item.children, false) : null}
        </DraggableTreeItem>
      ));
    return result;
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    const { id, memory_key, name, memory_image, code_snippet, description } = selectedItem;
    await updateMemoryItem(id, memory_key, name, memory_image, code_snippet, description);
    getTreeData();
  };

  const handleDropUpdate = async (draggedItemId, newParentId) => {
    if (newParentId === 'null') {
      newParentId = null;
    }
    await updateMemoryItemParent(draggedItemId, newParentId);
    const data = await fetchMemoryTree();
    setTreeData(data);
  };

  const handleCreateNewChild = async (parentId) => {
    try {

      const parentIdValue = parentId === "null" ? null : parentId;
      let highestMemoryKey = 0;
      console.log("handleCreateNewChild parentIdValue", parentIdValue)
      console.log("handleCreateNewChild parentId", parentId)

      if (!parentId) {
        console.log('create differnt query for this one')

        // If the parentId is null, we can't use  .eq('parent_id', parentId)

        // Step 1: Query for the rows where parent_id matches and order by memory_key descending
        const { data: highestMemoryKeyData, error: highestMemoryKeyError } = await supabase
          .from('memory_items')
          .select('memory_key')
          .is('parent_id', null)
          .order('memory_key', { ascending: false })  // Order by memory_key in descending order
          .limit(1);  // Limit to only the row with the highest memory_key

        highestMemoryKey = highestMemoryKeyData && highestMemoryKeyData.length > 0
          ? highestMemoryKeyData[0].memory_key + 1  // Set to 1 if no rows exist
          : 0;

        console.log("root?", highestMemoryKey, highestMemoryKeyData)
        if (highestMemoryKeyError) {
          throw new Error("Error fetching highest memory_key: " + highestMemoryKeyError.message);
        }

      } else {

        // Step 1: Query for the rows where parent_id matches and order by memory_key descending
        const { data: highestMemoryKeyData, error: highestMemoryKeyError } = await supabase
          .from('memory_items')
          .select('memory_key')
          .eq('parent_id', parentId)  // Filter by parent_id
          //  .filter('memory_key', 'is', null)  // This will filter out null values
          .order('memory_key', { ascending: false })  // Order by memory_key in descending order
          .limit(1);  // Limit to only the row with the highest memory_key

        highestMemoryKey = highestMemoryKeyData && highestMemoryKeyData.length > 0
          ? highestMemoryKeyData[0].memory_key + 1  // Set to 1 if no rows exist
          : 0;

        console.log('highestMemoryKeyData', highestMemoryKeyData[0])

        if (highestMemoryKeyError) {
          throw new Error("Error fetching highest memory_key: " + highestMemoryKeyError.message);
        }

      }



      // Step 2: Determine the new memory_key value

      const newMemoryKey = highestMemoryKey++;
      // const newMemoryKey = highestMemoryKeyData && highestMemoryKeyData.length > 0
      //   ? highestMemoryKeyData[0].memory_key + 1  // Set to 1 if no rows exist
      //   : 1;

      // Step 3: Insert the new child item with the new memory_key
      const { error, data: newItem } = await supabase
        .from('memory_items')
        .insert([{
          name: 'New Child Item',
          memory_key: newMemoryKey,  // Use the new memory_key
          memory_image: '',
          parent_id: parentId,
        }])
        .single();

      if (error) {
        console.error("Error creating new child item:", error);
      } else {
        setExpandedItemId(parentId);  // Set the expanded item to the newly created item's ID
        const updatedData = await fetchMemoryTree();
        setTreeData(updatedData);  // Refresh tree data
      }
    } catch (err) {
      console.error("Error in handleCreateNewChild:", err);
    }
  };



  const handleDelete = async () => {
    if (!selectedItem) return;

    // Function to recursively delete items and their children
    const deleteItemAndChildren = async (itemId) => {
      // First, delete all child items
      const { data: children } = await supabase
        .from('memory_items')
        .select('id')
        .eq('parent_id', itemId);

      // Recursively delete all children
      for (const child of children) {
        await deleteItemAndChildren(child.id);
      }

      // Then, delete the current item
      const { error } = await supabase
        .from('memory_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error("Error deleting item:", error);
      }
    };

    // Delete the selected item and all its children
    await deleteItemAndChildren(selectedItem.id);

    // Refresh the tree data after deletion
    getTreeData();
  };

  console.log(selectedItem);


  return (
    <DndProvider backend={HTML5Backend}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* <Box sx={{ flex: 1, minWidth: 250, maxWidth: 300 }}> */}
          {/* Resizable box */}
          <Box
            ref={boxRef}
            sx={{
              width,
              minWidth: 300,
              maxWidth: 600,
              overflowY: 'auto',
              position: 'relative',

              borderRight: '4px solid #ddd',
            }}
            onMouseDown={handleMouseDown} // Start resizing
          >
            {/* <Box sx={{ height: '90%', padding: 1 }}> */}
            <Box sx={{ height: '90vh', overflowY: 'auto', position: 'relative' }}>

              <SimpleTreeView apiRef={apiRef}>
                {mapTreeData(treeData)}
              </SimpleTreeView>
              <Tooltip title="Create new List">
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={() => handleCreateNewChild(null)}
                  size="small"
                  sx={{
                    position: 'sticky',
                    bottom: 16, // Distance from the bottom of the Box
                    right: 16,  // Distance from the right of the Box
                  }}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>


            </Box>

          </Box>

          <Box sx={{ flex: 1, padding: 2, height: '90vh', overflowY: 'auto' }}>
         

            {selectedItem ? (
              <>
                <ItemToolbar />
                <ItemDetailsTab selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
                {/* <h2>Edit Item</h2>
              <TextField
                label="Memory Key"
                value={selectedItem.memory_key}
                onChange={(e) => setSelectedItem({ ...selectedItem, memory_key: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Memory Name"
                value={selectedItem.name}
                onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Memory Image"
                value={selectedItem.memory_image}
                onChange={(e) => setSelectedItem({ ...selectedItem, memory_image: e.target.value })}
                fullWidth
                margin="normal"
              />
               <TextField
                label="Code Snippet"
                value={selectedItem.code_snippet || ''}
                onChange={(e) => setSelectedItem({ ...selectedItem, code_snippet: e.target.value })}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              /> */}
                {selectedItem.description &&
                  <Card sx={{ marginBottom: '10px' }}>
                    <CardContent>
                      <Box sx={{ overflow: 'auto', maxHeight: '400px' }}>
                        {selectedItem.description}
                      </Box>
                    </CardContent>
                  </Card>}
                {selectedItem.code_snippet && <CodeSnippet code={selectedItem.code_snippet} />}




                <ButtonGroup variant="contained" aria-label="Basic button group">
                  <Button variant="contained" onClick={handleSave} sx={{ marginTop: 2 }}>
                    Save
                  </Button>
                  <Button variant="contained" color="error" onClick={handleDelete} sx={{ marginTop: 2 }}>
                    Delete
                  </Button>


                </ButtonGroup>

              </>
            ) : (
              <p>Select an item to edit.</p>
            )}
          </Box>
        </Box>
      </Stack>
    </DndProvider>
  );
}

export default MUITreeView;


