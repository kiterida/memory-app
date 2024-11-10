import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useDrag, useDrop } from 'react-dnd';
import { fetchMemoryTree, updateMemoryItemParent, updateMemoryItem } from './memoryData';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ITEM_TYPE = 'TREE_ITEM';

export default function MUITreeView() {
  const [treeData, setTreeData] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null); // Track the expanded item
  const [selectedItem, setSelectedItem] = useState(null);

  const getTreeData = async () => {
    const data = await fetchMemoryTree();
    setTreeData(data);
  };

  useEffect(() => {
    getTreeData();
  }, []);

  const mapTreeData = (data) => {
    const result = data.map((item) => (
      <DraggableTreeItem
        key={item.id}
        item={item}
        onDropUpdate={handleDropUpdate}
        onSelectItem={setSelectedItem}
        onCreateNewChild={handleCreateNewChild}
        expandedItemId={expandedItemId} // Pass the expanded item ID
        setExpandedItemId={setExpandedItemId} // Set the expanded item ID
      >
        {item.children && item.children.length > 0 ? mapTreeData(item.children) : null}
      </DraggableTreeItem>
    ));

    

    return result;
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    const { id, memory_key, name, memory_image } = selectedItem;
    await updateMemoryItem(id, memory_key, name, memory_image);
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
    const { error, data: newItem } = await supabase
      .from('memory_items')
      .insert([
        {
          name: 'New Child Item',
          memory_key: '',
          memory_image: '',
          parent_id: parentId,
        },
      ])
      .single();

    if (error) {
      console.error("Error creating new child item:", error);
    } else {
      setExpandedItemId(parentId); // Set the expanded item to the newly created item's ID
      const updatedData = await fetchMemoryTree();
      setTreeData(updatedData); // Refresh tree data

      setExpandedItemId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ flex: 1, minWidth: 250, maxWidth: 300 }}>
        <SimpleTreeView
          expandedItems={expandedItemId ? [String(expandedItemId)] : []} // Controlled expansion
          onExpandedItemsChange={(newExpandedItems) => setExpandedItemId(newExpandedItems[0])} // Update expanded item
          defaultExpandedItems={expandedItemId ? [String(expandedItemId)] : []} // Initialize with the expanded item
        >
          {mapTreeData(treeData)}
        </SimpleTreeView>
      </Box>
      <Box sx={{ flex: 1, padding: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 2 }}>
          <Tooltip title="Create new Item">
            <IconButton onClick={() => handleCreateNewChild(null)} color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

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

function DraggableTreeItem({
  item,
  children,
  onDropUpdate,
  onSelectItem,
  onCreateNewChild,
  expandedItemId,
  setExpandedItemId,
}) {
  const [isHovered, setIsHovered] = useState(false);

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
        onDropUpdate(draggedItem.id, item.id);
      }
    },
  });

  const handleExpandChange = () => {
    if (item && expandedItemId !== null) {
      if (expandedItemId === item.id) {
        setExpandedItemId(null); // Collapse if the item is already expanded
      } else {
        setExpandedItemId(item.id); // Expand the selected item
      }
    }
  };

  return (
    <TreeItem
      ref={(node) => drag(drop(node))}
      itemId={String(item.id)}
      label={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            minHeight: '40px',
            paddingRight: '8px',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Box>
          {isHovered && (
            <Tooltip title="Add Child Item">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateNewChild(item.id);
                }}
                color="primary"
                size="small"
                sx={{ marginLeft: 'auto' }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      }
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      onClick={() => onSelectItem(item)}
      onToggle={handleExpandChange} // This triggers the expansion change
      expandIcon={<ExpandMoreIcon />} // Set the expand icon
      collapseIcon={<ChevronRightIcon />} // Set the collapse icon
    >
      {children}
    </TreeItem>
  );
}
