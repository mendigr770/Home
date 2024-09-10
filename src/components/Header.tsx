import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ניהול תקציב
        </Typography>
        <Box>
          {isMobile ? (
            <>
              <IconButton color="inherit" component={RouterLink} to="/">
                <DashboardIcon />
              </IconButton>
              <IconButton color="inherit" component={RouterLink} to="/expenses">
                <TableChartIcon />
              </IconButton>
              <IconButton color="inherit" component={RouterLink} to="/shopping-lists">
                <ShoppingCartIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/">
                דשבורד
              </Button>
              <Button color="inherit" component={RouterLink} to="/expenses">
                טבלת הוצאות
              </Button>
              <Button color="inherit" component={RouterLink} to="/shopping-lists">
                רשימת קניות
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;