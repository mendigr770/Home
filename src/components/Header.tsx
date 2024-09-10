import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ניהול תקציב
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            דשבורד
          </Button>
          <Button color="inherit" component={RouterLink} to="/expenses">
            טבלת הוצאות
          </Button>
          <Button color="inherit" component={RouterLink} to="/shopping-lists">
            רשימות קניות
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;