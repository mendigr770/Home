import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchShoppingLists, fetchShoppingListItems, addShoppingListItem, updateShoppingListItemStatus, ShoppingListItem, deleteShoppingListItem, updateShoppingListItem } from '../services/googleSheetsService';

const ShoppingLists: React.FC = () => {
  const [lists, setLists] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newListName, setNewListName] = useState<string>('');
  const [newProduct, setNewProduct] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState<ShoppingListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      loadItems(selectedList);
    }
  }, [selectedList]);

  const loadLists = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching shopping lists...');
      const fetchedLists = await fetchShoppingLists();
      console.log('Fetched lists:', fetchedLists);
      setLists(fetchedLists);
    } catch (err) {
      console.error('Error loading shopping lists:', err);
      setError('Failed to load shopping lists');
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async (listName: string) => {
    setIsLoading(true);
    try {
      const fetchedItems = await fetchShoppingListItems(listName);
      setItems(fetchedItems);
    } catch (err) {
      setError('Failed to load shopping list items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (newListName) {
      setIsLoading(true);
      try {
        await addShoppingListItem({
          product: 'דוגמה',
          quantity: 1,
          listName: newListName,
          status: 'ממתין'
        });
        setNewListName('');
        await loadLists();
        setSelectedList(newListName);
        setOpenDialog(false);
      } catch (err) {
        setError('Failed to create new list');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenAddItemDialog = () => {
    setAddItemDialogOpen(true);
  };

  const handleCloseAddItemDialog = () => {
    setAddItemDialogOpen(false);
    setNewProduct('');
    setNewQuantity(1);
  };

  const handleAddItem = async () => {
    if (newProduct && selectedList) {
      const newItem: ShoppingListItem = {
        product: newProduct,
        quantity: newQuantity,
        listName: selectedList,
        date: new Date().toISOString(),
        status: 'ממתין'
      };
      setItems(prevItems => [...prevItems, newItem]);
      handleCloseAddItemDialog();

      try {
        await addShoppingListItem(newItem);
      } catch (err) {
        setError('Failed to add item to the sheet');
        setItems(prevItems => prevItems.filter(item => item.product !== newItem.product));
      }
    }
  };

  const handleToggleItem = async (product: string, currentStatus: 'ממתין' | 'נרכש') => {
    const newStatus = currentStatus === 'ממתין' ? 'נרכש' : 'ממתין';
    setItems(prevItems => 
      prevItems.map(item => 
        item.product === product ? { ...item, status: newStatus } : item
      )
    );

    try {
      await updateShoppingListItemStatus(selectedList, product, newStatus);
    } catch (err) {
      setError('Failed to update item status');
      setItems(prevItems => 
        prevItems.map(item => 
          item.product === product ? { ...item, status: currentStatus } : item
        )
      );
    }
  };

  const handleDeleteItem = async (product: string) => {
    setItems(prevItems => prevItems.filter(item => item.product !== product));

    try {
      await deleteShoppingListItem(selectedList, product);
    } catch (err) {
      setError('Failed to delete item');
      await loadItems(selectedList);
    }
  };

  const handleEditItem = (item: ShoppingListItem) => {
    setEditItem(item);
  };

  const handleSaveEdit = async () => {
    if (editItem) {
      const originalItem = items.find(item => item.product === editItem.product);
      setItems(prevItems => 
        prevItems.map(item => 
          item.product === editItem.product ? editItem : item
        )
      );
      setEditItem(null);

      try {
        await updateShoppingListItem(selectedList, editItem);
      } catch (err) {
        setError('Failed to update item');
        if (originalItem) {
          setItems(prevItems => 
            prevItems.map(item => 
              item.product === editItem.product ? originalItem : item
            )
          );
        }
      }
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleRefresh = async () => {
    await loadLists();
    if (selectedList) {
      await loadItems(selectedList);
    }
  };

  const pendingItems = items.filter(item => item.status === 'ממתין');
  const purchasedItems = items.filter(item => item.status === 'נרכש');

  const renderStatusIcon = (status: 'ממתין' | 'נרכש') => {
    return status === 'ממתין' ? <RadioButtonUncheckedIcon /> : <CheckCircleIcon />;
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2, position: 'relative', minHeight: '80vh' }}>
      <Typography variant="h4" gutterBottom align="center">רשימות קניה</Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleRefresh} color="primary" disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>בחר רשימה קיימת</Typography>
          <IconButton color="primary" onClick={() => setOpenDialog(true)}>
            <PlaylistAddIcon />
          </IconButton>
        </Box>
        <FormControl fullWidth>
          <InputLabel>רשימות קניה</InputLabel>
          <Select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value as string)}
          >
            {lists.map(list => (
              <MenuItem key={list} value={list}>{list}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedList && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>{selectedList}</Typography>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-end' }}>
            <TextField
              label="מוצר חדש"
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ mr: 1, flexGrow: 1 }}
            />
            <TextField
              label="כמות"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
              onKeyPress={handleKeyPress}
              sx={{ mr: 1, width: 70 }}
            />
            <Button 
              variant="contained" 
              onClick={handleAddItem} 
              startIcon={<AddIcon />}
              sx={{ height: '56px', minWidth: '120px', ml: 2 }} // Added ml: 2 for left margin
            >
              הוסף
            </Button>
          </Box>

          <Typography variant="h6">מוצרים לקניה</Typography>
          <List>
            {pendingItems.map((item) => (
              <ListItem key={item.product} disablePadding>
                <IconButton edge="start" onClick={() => handleToggleItem(item.product, item.status)}>
                  {renderStatusIcon(item.status)}
                </IconButton>
                <ListItemText primary={`${item.product} (${item.quantity})`} />
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.product)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>

          {purchasedItems.length > 0 && (
            <>
              <Typography variant="h6">מוצרים שנרכשו</Typography>
              <List>
                {purchasedItems.map((item) => (
                  <ListItem key={item.product} disablePadding>
                    <IconButton edge="start" onClick={() => handleToggleItem(item.product, item.status)}>
                      {renderStatusIcon(item.status)}
                    </IconButton>
                    <ListItemText 
                      primary={`${item.product} (${item.quantity})`} 
                      sx={{ textDecoration: 'line-through' }} 
                    />
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.product)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}

      <Fab 
        color="primary" 
        aria-label="add"
        onClick={selectedList ? handleOpenAddItemDialog : () => setOpenDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>צור רשימה חדשה</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם הרשימה החדשה"
            fullWidth
            variant="standard"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button onClick={handleCreateList}>צור</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addItemDialogOpen} onClose={handleCloseAddItemDialog}>
        <DialogTitle>הוסף מוצר חדש</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם המוצר"
            fullWidth
            variant="standard"
            value={newProduct}
            onChange={(e) => setNewProduct(e.target.value)}
          />
          <TextField
            margin="dense"
            label="כמות"
            type="number"
            fullWidth
            variant="standard"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddItemDialog}>ביטול</Button>
          <Button onClick={handleAddItem}>הוסף</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
        <DialogTitle>ערוך מוצר</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם המוצר"
            fullWidth
            variant="standard"
            value={editItem?.product || ''}
            onChange={(e) => setEditItem(prev => prev ? {...prev, product: e.target.value} : null)}
          />
          <TextField
            margin="dense"
            label="כמות"
            type="number"
            fullWidth
            variant="standard"
            value={editItem?.quantity || ''}
            onChange={(e) => setEditItem(prev => prev ? {...prev, quantity: parseInt(e.target.value, 10)} : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>ביטול</Button>
          <Button onClick={handleSaveEdit}>שמור</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShoppingLists;