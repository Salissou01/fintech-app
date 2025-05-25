import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, CssBaseline, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, Button, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, TextField, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';

const drawerWidth = 240;

const Recharges: React.FC = () => {
  const navigate = useNavigate();
  const [recharges, setRecharges] = useState<any>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ user_id: '', amount: '', provider: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchRecharges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/topups', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, page }
      });
      setRecharges(response.data);
    } catch (err) {
      console.error('Erreur chargement recharges', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1 } 
      });
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs', err);
    }
  };

  useEffect(() => {
    fetchRecharges();
    fetchUsers();
  }, [search, page]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleAddRecharge = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/admin/topups', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Recharge ajoutée avec succès !', severity: 'success' });
      setOpen(false);
      setFormData({ user_id: '', amount: '', provider: '' });
      fetchRecharges();
    } catch (err) {
      console.error('Erreur ajout recharge', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'ajout.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Fintech Admin – Recharges
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
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
           <ListItemButton onClick={() => navigate('/wallets')}>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Wallets" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
            <ListItemText primary="Recharges" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/transfers')}>
            <ListItemIcon><MonetizationOnIcon /></ListItemIcon>
            <ListItemText primary="Transferts" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/notifications')}>
            <ListItemIcon><NotificationsIcon /></ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/users')}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Utilisateurs" />
          </ListItemButton>
        </List>
        <Divider />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>Liste des recharges</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Recherche"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Ajouter Recharge
          </Button>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Référence</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recharges.data && recharges.data.map((topup: any) => (
                <TableRow key={topup.id}>
                  <TableCell>{topup.user?.email || '-'}</TableCell>
                  <TableCell>{topup.amount}</TableCell>
                  <TableCell>{topup.provider}</TableCell>
                  <TableCell>{topup.reference}</TableCell>
                  <TableCell>{new Date(topup.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {recharges.last_page && (
          <Pagination count={recharges.last_page} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
        )}

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Ajouter une recharge</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>Utilisateur</InputLabel>
              <Select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                label="Utilisateur"
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.email} ({user.phone})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Montant" margin="dense" type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            <FormControl fullWidth margin="dense">
              <InputLabel>Provider</InputLabel>
              <Select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                label="Provider"
              >
                <MenuItem value="Wave">Wave</MenuItem>
                <MenuItem value="Orange Money">Orange Money</MenuItem>
                <MenuItem value="Free Money">Free Money</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleAddRecharge}>Ajouter</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
          <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Recharges;
