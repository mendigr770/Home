import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          ניהול הוצאות הבית
        </Typography>
        <Button color="inherit" component={Link} to="/">
          דשבורד
        </Button>
        <Button color="inherit" component={Link} to="/expenses">
          טבלת הוצאות
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;