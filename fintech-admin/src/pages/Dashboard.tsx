import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api'; // ✅ instance Axios

const drawerWidth = 240;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    userCount: 0,
    topupCount: 0,
    topupAmount: 0,
    transferCount: 0,
    notificationCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/admin/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des stats", err);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.userCount,
      icon: <PeopleIcon fontSize="large" color="secondary" />,
    },
    {
      title: 'Recharges',
      value: stats.topupCount,
      icon: <AccountBalanceWalletIcon fontSize="large" color="primary" />,
    },
    {
      title: 'Montant Rechargé',
      value: `${stats.topupAmount} F`,
      icon: <MonetizationOnIcon fontSize="large" color="success" />,
    },
    {
      title: 'Transferts',
      value: stats.transferCount,
      icon: <DashboardIcon fontSize="large" color="info" />,
    },
    {
      title: 'Notifications',
      value: stats.notificationCount,
      icon: <NotificationsIcon fontSize="large" color="warning" />,
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Fintech Admin Dashboard
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton><ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText primary="Dashboard" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/wallets')}>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Wallets" />
          </ListItemButton>
            <ListItemButton onClick={() => navigate('/recharges')}><ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Recharges" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/transfers')}><ListItemIcon><MonetizationOnIcon /></ListItemIcon><ListItemText primary="Transferts" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/notifications')}><ListItemIcon><NotificationsIcon /></ListItemIcon><ListItemText primary="Notifications" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/users')}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Utilisateurs" />
            </ListItemButton>

          </List>
          <Divider />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f3f6f9', p: 3, minHeight: '100vh' }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>
          Vue d'ensemble
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {statCards.map((stat, index) => (
            <Box key={index} sx={{ flex: '1 1 calc(25% - 24px)', minWidth: '250px' }}>
              <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    {stat.icon}
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        {stat.title}
                      </Typography>
                      <Typography variant="h6">{stat.value}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
