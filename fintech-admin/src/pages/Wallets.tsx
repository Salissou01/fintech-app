import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, CssBaseline, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, Button, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, TextField, Pagination
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';

const drawerWidth = 240;

const Wallets: React.FC = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<any>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/wallets', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, page }
      });
      setWallets(response.data);
    } catch (err) {
      console.error('Erreur chargement wallets', err);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [search, page]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Fintech Admin – Wallets
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <List>
          <ListItemButton onClick={() => navigate('/dashboard')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton selected>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Wallets" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/recharges')}>
            <ListItemIcon><MonetizationOnIcon /></ListItemIcon><ListItemText primary="Recharges" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/transfers')}>
            <ListItemIcon><MonetizationOnIcon /></ListItemIcon><ListItemText primary="Transferts" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/notifications')}>
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
        <Typography variant="h5" gutterBottom>Liste des Wallets</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Recherche"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
        <Paper sx={{ width: '100%', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Solde</TableCell>
                <TableCell>Numéro de Carte</TableCell>
                <TableCell>Créé le</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wallets.data?.map((wallet: any) => (
                <TableRow key={wallet.id}>
                  <TableCell>{wallet.user?.prenom} {wallet.user?.nom}</TableCell>
                  <TableCell>{wallet.user?.phone}</TableCell>
                  <TableCell>{wallet.user?.email}</TableCell>
                  <TableCell>{wallet.balance}</TableCell>
                  <TableCell>{wallet.card_number}</TableCell>
                  <TableCell>{new Date(wallet.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        {wallets.last_page && (
          <Pagination count={wallets.last_page} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
        )}
      </Box>
    </Box>
  );
};

export default Wallets;
