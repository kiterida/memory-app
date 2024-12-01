import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Box from '@mui/material/Box';
import { IconButton, Tooltip } from '@mui/material';
import { Star } from '@mui/icons-material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { updateStarred } from './memoryData';
import AddIcon from '@mui/icons-material/Add';

const ITEM_TYPE = 'TREE_ITEM';

const DraggableTreeItem = ({
    item,
    children,
    onDropUpdate,
    onSelectItem,
    onCreateNewChild,
    expandedItemId,
    setExpandedItemId,
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    // console.log(item.starred);
    const [{ isDragging: dragActive }, drag] = useDrag({
      type: ITEM_TYPE,
      item: () => {
        setIsDragging(true);
        return { id: item.id, parent_id: item.parent_id };
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: () => setIsDragging(false),
    });
  
    const resetParentIdOnLeftDrop = async (draggedItem) => {
      await onDropUpdate(draggedItem.id, null); // Set parent_id to null
    };
  
    const [, drop] = useDrop({
      accept: ITEM_TYPE,
      drop: (draggedItem, monitor) => {
        const dropOffset = monitor.getDifferenceFromInitialOffset();
  
        if (dropOffset && dropOffset.x < -100) { // Adjust threshold if needed
          // Dragged item is outside to the left, reset parent_id
          resetParentIdOnLeftDrop(draggedItem);
        } else if (draggedItem.id !== item.id) {
          // Drop within the tree
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
  
    const getSubItemCount = (item) => {
      return item.children ? item.children.length : 0;
    };
  
    return (
      <TreeItem
        ref={(node) => drag(drop(node))}
        itemId={String(item.id)}
        onClick={() => onSelectItem(item)}
        label={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              minHeight: '40px',
              paddingRight: '8px',
              paddingLeft: isDragging ? '200px' : '8px', // Expand padding when dragging
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name} {' '}{isHovered && <> [ {getSubItemCount(item)} ]</>}</Box>
            {isHovered && (
              <div>
              <Tooltip title="Star List">
              <IconButton
                onClick={(e) => {
                  const toogle = !item.starred;
                  updateStarred(item.id, toogle);
                //   console.log('toggle star item:', toogle);
                  e.stopPropagation();
                }}
                >
                  {item.starred ? <Star /> : <StarBorderIcon />}
              </IconButton>
              </Tooltip>
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
              </div>
            )}
          </Box>
        }
        style={{
          opacity: dragActive ? 0.5 : 1,
        }}
      >
        {children}
      </TreeItem>
    );
  }

  export default DraggableTreeItem;