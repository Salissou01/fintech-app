import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, CssBaseline, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, Button, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, Pagination, Snackbar, Alert, IconButton
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';

const drawerWidth = 240;

interface Notification {
  id: number;
  title: string;
  message: string;
  user?: { email: string; phone: string };
  created_at: string;
  is_read: boolean;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<{ data: Notification[]; last_page?: number }>({ data: [] });
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Erreur chargement notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/admin/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Notification marquée comme lue', severity: 'success' });
      fetchNotifications(); 
    } catch (err) {
      console.error('Erreur marquage comme lu', err);
      setSnackbar({ open: true, message: 'Erreur lors du marquage', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Fintech Admin – Notifications
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
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          <ListItemButton onClick={() => navigate('/dashboard')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText primary="Dashboard" />
          </ListItemButton>
           <ListItemButton onClick={() => navigate('/wallets')}>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Wallets" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/recharges')}>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Recharges" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/transfers')}>
            <ListItemIcon><MonetizationOnIcon /></ListItemIcon><ListItemText primary="Transferts" />
          </ListItemButton>
          <ListItemButton selected>
            <ListItemIcon><NotificationsIcon /></ListItemIcon><ListItemText primary="Notifications" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/users')}>
            <ListItemIcon><PeopleIcon /></ListItemIcon><ListItemText primary="Utilisateurs" />
          </ListItemButton>
        </List>
        <Divider />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>Liste des notifications</Typography>
        <Paper sx={{ width: '100%', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Lu</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.data.length > 0 ? (
                notifications.data.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell>{notif.title}</TableCell>
                    <TableCell>{notif.message}</TableCell>
                    <TableCell>{notif.user ? `${notif.user.email} (${notif.user.phone})` : '-'}</TableCell>
                    <TableCell>{new Date(notif.created_at).toLocaleString()}</TableCell>
                    <TableCell>{notif.is_read ? 'Oui' : 'Non'}</TableCell>
                    <TableCell>
                      {!notif.is_read && (
                        <IconButton onClick={() => markAsRead(notif.id)}>
                          <MarkEmailReadIcon color="primary" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">Aucune notification trouvée.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
        {notifications.last_page && (
          <Pagination count={notifications.last_page} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
        )}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Notifications;
