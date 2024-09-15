import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, List, ListItem, ListItemText, 
  Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Fab, 
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  Drawer, Divider, ListItemButton, Grid, Slide, Zoom, Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { fetchShoppingLists, fetchShoppingListItems, addShoppingListItem, updateShoppingListItem, ShoppingListItem, deleteShoppingListItem } from '../services/googleSheetsService';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

interface ShoppingListWithDate {
  name: string;
  lastUpdated: Date;
}

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
  const [newItems, setNewItems] = useState<{ product: string; quantity: number }[]>([{ product: '', quantity: 1 }]);
  const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listsWithDates, setListsWithDates] = useState<ShoppingListWithDate[]>([]);

  const theme = useTheme();

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
      
      const listsWithDates: ShoppingListWithDate[] = await Promise.all(
        fetchedLists.map(async (list) => {
          const items = await fetchShoppingListItems(list);
          const lastUpdated = items.reduce((latest, item) => {
            const itemDate = new Date(item.date);
            return itemDate > latest ? itemDate : latest;
          }, new Date(0));
          return { name: list, lastUpdated };
        })
      );

      listsWithDates.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
      setListsWithDates(listsWithDates);
      setLists(listsWithDates.map(l => l.name));
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
    setNewItems([{ product: '', quantity: 1 }]);
    setAddItemDialogOpen(true);
  };

  const handleCloseAddItemDialog = () => {
    setAddItemDialogOpen(false);
  };

  const handleAddNewItemField = () => {
    setNewItems([...newItems, { product: '', quantity: 1 }]);
  };

  const handleNewItemChange = (index: number, field: 'product' | 'quantity', value: string | number) => {
    const updatedItems = [...newItems];
    updatedItems[index][field] = value as never; // Type assertion to avoid TS error
    setNewItems(updatedItems);
  };

  const handleAddItems = async () => {
    if (selectedList) {
      const validItems = newItems.filter(item => item.product.trim() !== '');
      setAddItemDialogOpen(false); // סגירת הדיאלוג מיד לאחר הלחיצה
      for (const item of validItems) {
        const newItem: ShoppingListItem = {
          product: item.product,
          quantity: item.quantity,
          listName: selectedList,
          date: new Date().toISOString(),
          status: 'ממתין'
        };
        setItems(prevItems => [...prevItems, newItem]);
        try {
          await addShoppingListItem(newItem);
        } catch (err) {
          setError(`Failed to add item "${item.product}" to the sheet`);
          setItems(prevItems => prevItems.filter(i => i.product !== item.product));
        }
      }
      setNewItems([{ product: '', quantity: 1 }]); // איפוס שדות ההוספה
    }
  };

  const handleToggleItem = async (product: string, currentStatus: 'ממתין' | 'נרכש') => {
    const newStatus: 'ממתין' | 'נרכש' = currentStatus === 'ממתין' ? 'נרכש' : 'ממתין';
    const updatedItem = items.find(item => item.product === product);
    
    if (updatedItem) {
      const newItem: ShoppingListItem = { ...updatedItem, status: newStatus };
      setItems(prevItems => 
        prevItems.map(item => 
          item.product === product ? newItem : item
        )
      );

      try {
        await updateShoppingListItem(selectedList, product, newItem);
      } catch (err) {
        setError('Failed to update item status');
        setItems(prevItems => 
          prevItems.map(item => 
            item.product === product ? updatedItem : item
          )
        );
      }
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

  const handleItemClick = (item: ShoppingListItem) => {
    setSelectedItem({...item});
  };

  const handleCloseItemDialog = () => {
    setSelectedItem(null);
  };

  const handleUpdateItem = async () => {
    if (selectedItem) {
      try {
        const oldProduct = items.find(item => item.product === selectedItem.product)?.product || selectedItem.product;
        await updateShoppingListItem(selectedList, oldProduct, selectedItem);
        setItems(prevItems => prevItems.map(item => 
          item.product === oldProduct ? selectedItem : item
        ));
        handleCloseItemDialog();
      } catch (err) {
        setError('Failed to update item');
      }
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
    return status === 'ממתין' 
      ? <RadioButtonUncheckedIcon sx={{ color: theme.palette.warning.main }} /> 
      : <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleListSelect = (list: string) => {
    setSelectedList(list);
    setDrawerOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250, padding: 2, height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">רשימות קניות</Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Button 
        variant="contained"
        fullWidth
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        צור רשימה חדשה
      </Button>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ direction: 'rtl', flexGrow: 1, overflowY: 'auto' }}>
        {listsWithDates.map((list, index) => (
          <React.Fragment key={list.name}>
            <ListItemButton 
              onClick={() => handleListSelect(list.name)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText 
                primary={list.name} 
                secondary={list.lastUpdated.toLocaleDateString('he-IL')}
                sx={{
                  '& .MuiListItemText-primary': {
                    textAlign: 'right',
                  },
                  '& .MuiListItemText-secondary': {
                    textAlign: 'right',
                  },
                }}
              />
            </ListItemButton>
            {index < listsWithDates.length - 1 && (
              <Divider variant="middle" sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const renderSkeletonLoader = () => (
    <Grid container spacing={2}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1 }} />
        </Grid>
      ))}
    </Grid>
  );

  const renderAllLists = () => (
    <Grid container spacing={2}>
      {listsWithDates.map((list) => (
        <Grid item xs={12} sm={6} md={4} key={list.name}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              cursor: 'pointer', 
              '&:hover': { backgroundColor: theme.palette.action.hover },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onClick={() => handleListSelect(list.name)}
          >
            <Typography variant="h6">{list.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              עודכן לאחרונה: {list.lastUpdated.toLocaleDateString('he-IL')}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2, position: 'relative', minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
            רשימת קניות
          </Typography>
          <Box>
            <IconButton onClick={handleRefresh} color="primary" disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={handleDrawerToggle} edge="end">
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>
      </motion.div>

      {isLoading ? (
        renderSkeletonLoader()
      ) : selectedList ? (
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main }}>{selectedList}</Typography>

            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>מוצרים לקניה</Typography>
            <List>
              <AnimatePresence>
                {pendingItems.map((item) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem 
                      disablePadding 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <IconButton edge="start" onClick={() => handleToggleItem(item.product, item.status)}>
                        {renderStatusIcon(item.status)}
                      </IconButton>
                      <ListItemText 
                        primary={`${item.product} (${item.quantity})`} 
                        sx={{ color: theme.palette.text.primary }}
                      />
                      <IconButton onClick={() => handleItemClick(item)}>
                        <EditIcon sx={{ color: theme.palette.primary.main }} />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem(item.product)}>
                        <DeleteIcon sx={{ color: theme.palette.error.main }} />
                      </IconButton>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>

            {purchasedItems.length > 0 && (
              <>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mt: 2 }}>מוצרים שנרכשו</Typography>
                <List>
                  <AnimatePresence>
                    {purchasedItems.map((item) => (
                      <motion.div
                        key={item.product}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ListItem 
                          disablePadding
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: theme.palette.action.hover },
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <IconButton edge="start" onClick={() => handleToggleItem(item.product, item.status)}>
                            {renderStatusIcon(item.status)}
                          </IconButton>
                          <ListItemText 
                            primary={`${item.product} (${item.quantity})`} 
                            sx={{ 
                              textDecoration: 'line-through',
                              color: theme.palette.text.secondary
                            }} 
                          />
                          <IconButton onClick={() => handleItemClick(item)}>
                            <EditIcon sx={{ color: theme.palette.primary.main }} />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteItem(item.product)}>
                            <DeleteIcon sx={{ color: theme.palette.error.main }} />
                          </IconButton>
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </List>
              </>
            )}
          </Paper>
        </Slide>
      ) : (
        renderAllLists()
      )}

      <Zoom in={true} style={{ transitionDelay: '500ms' }}>
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={selectedList ? handleOpenAddItemDialog : () => setOpenDialog(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        SlideProps={{
          direction: 'right'
        }}
      >
        {drawer}
      </Drawer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>צור רשימת קניות חדשה</DialogTitle>
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
        <DialogTitle>הוסף מוצרים חדשים</DialogTitle>
        <DialogContent>
          {newItems.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', mb: 2 }}>
              <TextField
                label="שם המוצר"
                value={item.product}
                onChange={(e) => handleNewItemChange(index, 'product', e.target.value)}
                sx={{ mr: 1, flexGrow: 1 }}
              />
              <TextField
                label="כמות"
                type="number"
                value={item.quantity}
                onChange={(e) => handleNewItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                sx={{ width: 70 }}
              />
            </Box>
          ))}
          <Button onClick={handleAddNewItemField}>הוסף שדה מוצר נוסף</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddItemDialog}>ביטול</Button>
          <Button onClick={handleAddItems}>הוסף</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedItem} onClose={handleCloseItemDialog}>
        <DialogTitle>עריכת מוצר</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם המוצר"
            fullWidth
            value={selectedItem?.product || ''}
            onChange={(e) => setSelectedItem(prev => prev ? {...prev, product: e.target.value} : null)}
          />
          <TextField
            margin="dense"
            label="כמות"
            type="number"
            fullWidth
            value={selectedItem?.quantity || ''}
            onChange={(e) => setSelectedItem(prev => prev ? {...prev, quantity: parseInt(e.target.value, 10)} : null)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>סטטוס</InputLabel>
            <Select
              value={selectedItem?.status || 'ממתין'}
              onChange={(e) => setSelectedItem(prev => prev ? {...prev, status: e.target.value as 'ממתין' | 'נרכש'} : null)}
            >
              <MenuItem value="ממתין">ממתין</MenuItem>
              <MenuItem value="נרכש">נרכש</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog}>ביטול</Button>
          <Button onClick={handleUpdateItem}>שמור</Button>
          <Button onClick={() => { handleDeleteItem(selectedItem!.product); handleCloseItemDialog(); }} color="error">מחק</Button>
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