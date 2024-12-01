// src/memoryData.js
import { supabase } from './supabaseClient';

// Fetch memory tree data from Supabase, order it by integer memory_key, and structure it as a nested tree
export const fetchMemoryTree = async () => {
    const { data, error } = await supabase.rpc('fetch_memory_tree_with_starred');
    if (error) {
      console.error("Error fetching memory tree:", error);
      return [];
    }
  
    // Sort data with null parent_id items first, ordered by integer memory_key
    data.sort((a, b) => {
      if (a.parent_id === null && b.parent_id !== null) return -1;
      if (a.parent_id !== null && b.parent_id === null) return 1;
      if (a.parent_id === b.parent_id) {
        // Convert memory_key to integer for comparison
        return parseInt(a.memory_key, 10) - parseInt(b.memory_key, 10);
      }
      return 0;
    });
  
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
  
    return nestedData;
  };
  
// // Fetch memory tree data from Supabase, order it, and structure it as a nested tree
// export const fetchMemoryTree = async () => {
//     const { data, error } = await supabase.rpc('fetch_memory_tree');
//     if (error) {
//       console.error("Error fetching memory tree:", error);
//       return [];
//     }
  
//     // Sort data with null parent_id items first, ordered by memory_key
//     data.sort((a, b) => {
//       if (a.parent_id === null && b.parent_id !== null) return -1;
//       if (a.parent_id !== null && b.parent_id === null) return 1;
//       if (a.parent_id === b.parent_id) {
//         return a.memory_key.localeCompare(b.memory_key);
//       }
//       return 0;
//     });
  
//     const dataMap = {};
//     data.forEach((item) => {
//       dataMap[item.id] = { ...item, children: [] };
//     });
  
//     const nestedData = [];
//     data.forEach((item) => {
//       if (item.parent_id === null) {
//         nestedData.push(dataMap[item.id]);
//       } else if (dataMap[item.parent_id]) {
//         dataMap[item.parent_id].children.push(dataMap[item.id]);
//       }
//     });
  
//     return nestedData;
//   };
  

// Fetch memory tree data from Supabase and structure it as a nested tree
export const fetchMemoryTreeOriginal = async () => {
  const { data, error } = await supabase.rpc('fetch_memory_tree');
  if (error) {
    console.error("Error fetching memory tree:", error);
    return [];
  }

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

  return nestedData;
};

// Update the starred status of an item
export const updateStarred = async (memoryId, starredStatus) => {
  console.log("updateStarred", memoryId, starredStatus)

  try {
  const { error } = await supabase
      .from('memory_items')
      .update({ starred: starredStatus})
      .eq('id', memoryId);

      if(error) throw error;
  } catch(err) {
    console.log("Error updating starred item");
  }
}

// Update the parent_id of a memory item (drag and drop logic)
export const updateMemoryItemParent = async (draggedItemId, newParentId) => {
  try {
    if (draggedItemId === newParentId) {
      console.error("Cannot drop an item onto itself.");
      return;
    }

    const { error } = await supabase
      .from('memory_items')
      .update({ parent_id: newParentId })
      .eq('id', draggedItemId);

    if (error) throw error;
  } catch (err) {
    console.error("Error updating memory item:", err);
  }
};

// Update a memory item in Supabase (for the edit form)
export const updateMemoryItem = async (id, memory_key, name, memory_image, code_snippet) => {
  const { error } = await supabase
    .from('memory_items')
    .update({ memory_key, name, memory_image, code_snippet })
    .eq('id', id);

  if (error) {
    console.error("Error updating memory item:", error);
  } else {
    console.log("Item updated successfully!");
  }
};
