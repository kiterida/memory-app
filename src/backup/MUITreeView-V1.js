import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useDrag, useDrop } from 'react-dnd';
import { supabase } from '../supabaseClient';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const ITEM_TYPE = 'TREE_ITEM';

export default function MUITreeView({ treeData, onDropUpdate }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const mapTreeData = (data) => {
    return data.map((item) => (
      <DraggableTreeItem
        key={item.id}
        item={item}
        onDropUpdate={onDropUpdate}
        onSelectItem={setSelectedItem} // Pass the setter to select items
      >
        {item.children && item.children.length > 0 ? mapTreeData(item.children) : null}
      </DraggableTreeItem>
    ));
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    const { id, memory_key, memory_name, memory_image } = selectedItem;

    // Update the selected item in Supabase (example)
    const { error } = await supabase
      .from('memory_items')
      .update({ memory_key, memory_name, memory_image })
      .eq('id', id);

    if (error) {
      console.error("Error updating memory item:", error);
    } else {
      console.log("Item updated successfully!");
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side: Tree View */}
      <Box sx={{ flex: 1, minWidth: 250, maxWidth: 300 }}>
        <SimpleTreeView>
          {mapTreeData(treeData)}
        </SimpleTreeView>
      </Box>

      {/* Right side: Edit Form */}
      <Box sx={{ flex: 1, padding: 2 }}>
        {selectedItem ? (
          <>
            <h2>Edit Item</h2>
            <TextField
              label="Memory Key"
              value={selectedItem.memory_key}
              onChange={(e) => setSelectedItem({ ...selectedItem, memory_key: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Memory Name"
              value={selectedItem.memory_name}
              onChange={(e) => setSelectedItem({ ...selectedItem, memory_name: e.target.value })}
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
            <Button variant="contained" onClick={handleSave} sx={{ marginTop: 2 }}>
              Save
            </Button>
          </>
        ) : (
          <p>Select an item to edit.</p>
        )}
      </Box>
    </Box>
  );
}

function DraggableTreeItem({ item, children, onDropUpdate, onSelectItem }) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: item.id, parent_id: item.parent_id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (draggedItem) => {
      if (draggedItem.id !== item.id) {
        onDropUpdate(draggedItem.id, item.id); // Call parent function to update the tree
      }
    },
  });

  return (
    <TreeItem
      ref={(node) => drag(drop(node))}
      itemId={String(item.id)}
      label={item.name}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      onClick={() => onSelectItem(item)} // Set the selected item when clicked
    >
      {children}
    </TreeItem>
  );
}
