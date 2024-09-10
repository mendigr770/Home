import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Checkbox, Select, MenuItem, FormControl, InputLabel, Paper, Grid, Divider, IconButton, Fab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchShoppingLists, fetchShoppingListItems, addShoppingListItem, updateShoppingListItemStatus, ShoppingListItem } from '../services/googleSheetsService';

const ShoppingLists: React.FC = () => {
  const [lists, setLists] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newListName, setNewListName] = useState<string>('');
  const [newProduct, setNewProduct] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      loadItems(selectedList);
    }
  }, [selectedList]);

  const loadLists = async () => {
    const fetchedLists = await fetchShoppingLists();
    setLists(fetchedLists);
  };

  const loadItems = async (listName: string) => {
    const fetchedItems = await fetchShoppingListItems(listName);
    setItems(fetchedItems);
  };

  const handleCreateList = async () => {
    if (newListName) {
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
    }
  };

  const handleAddItem = async () => {
    if (newProduct && selectedList) {
      await addShoppingListItem({
        product: newProduct,
        quantity: newQuantity,
        listName: selectedList,
        status: 'ממתין'
      });
      setNewProduct('');
      setNewQuantity(1);
      await loadItems(selectedList);
    }
  };

  const handleToggleItem = async (product: string, currentStatus: 'ממתין' | 'נרכש') => {
    const newStatus = currentStatus === 'ממתין' ? 'נרכש' : 'ממתין';
    await updateShoppingListItemStatus(selectedList, product, newStatus);
    await loadItems(selectedList);
  };

  const pendingItems = items.filter(item => item.status === 'ממתין');
  const purchasedItems = items.filter(item => item.status === 'נרכש');

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2, position: 'relative', minHeight: '80vh' }}>
      <Typography variant="h4" gutterBottom align="center">רשימות קניה</Typography>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>בחר רשימה קיימת</Typography>
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
              sx={{ mr: 1, flexGrow: 1 }}
            />
            <TextField
              label="כמות"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
              sx={{ mr: 1, width: 70 }}
            />
            <Button variant="contained" onClick={handleAddItem} startIcon={<AddIcon />}>
              הוסף
            </Button>
          </Box>

          <Typography variant="h6">מוצרים לקניה</Typography>
          <List>
            {pendingItems.map((item) => (
              <ListItem key={item.product} disablePadding>
                <Checkbox
                  edge="start"
                  checked={item.status === 'נרכש'}
                  onChange={() => handleToggleItem(item.product, item.status)}
                />
                <ListItemText primary={`${item.product} (${item.quantity})`} />
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>

          {purchasedItems.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">מוצרים שנרכשו</Typography>
              <List>
                {purchasedItems.map((item) => (
                  <ListItem key={item.product} disablePadding>
                    <Checkbox
                      edge="start"
                      checked={item.status === 'נרכש'}
                      onChange={() => handleToggleItem(item.product, item.status)}
                    />
                    <ListItemText primary={`${item.product} (${item.quantity})`} sx={{ textDecoration: 'line-through' }} />
                    <IconButton edge="end" aria-label="delete">
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
        onClick={() => setOpenDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
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
    </Box>
  );
};

export default ShoppingLists;