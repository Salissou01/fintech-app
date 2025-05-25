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

const Transfers: React.FC = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<any>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ sender_id: '', receiver_id: '', amount: '', note: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchTransfers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/transfers', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, page }
      });
      setTransfers(response.data);
    } catch (err) {
      console.error('Erreur chargement transferts', err);
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
    fetchTransfers();
    fetchUsers();
  }, [search, page]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleAddTransfer = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/admin/transfers', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Transfert effectué avec succès !', severity: 'success' });
      setOpen(false);
      setFormData({ sender_id: '', receiver_id: '', amount: '', note: '' });
      fetchTransfers();
    } catch (err) {
      console.error('Erreur transfert', err);
      setSnackbar({ open: true, message: 'Erreur lors du transfert.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Fintech Admin – Transferts
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <List>
          <ListItemButton onClick={() => navigate('/dashboard')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
           <ListItemButton onClick={() => navigate('/wallets')}>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon><ListItemText primary="Wallets" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/recharges')}>
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
        <Typography variant="h5" gutterBottom>Liste des transferts</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField label="Recherche" variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Effectuer Transfert
          </Button>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Expéditeur</TableCell>
                <TableCell>Destinataire</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.data && transfers.data.map((t: any) => (
                <TableRow key={t.id}>
                <TableCell>{t.sender ? `${t.sender.email} (${t.sender.phone})` : '-'}</TableCell>
                <TableCell>{t.receiver ? `${t.receiver.email} (${t.receiver.phone})` : '-'}</TableCell>

                  <TableCell>{t.amount}</TableCell>
                  <TableCell>{t.note}</TableCell>
                  <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {transfers.last_page && (
          <Pagination count={transfers.last_page} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
        )}

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Effectuer un transfert</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>Expéditeur</InputLabel>
              <Select value={formData.sender_id} onChange={e => setFormData({...formData, sender_id: e.target.value})} label="Expéditeur">
                {users.map(u => <MenuItem key={u.id} value={u.id.toString()}>{u.email} ({u.phone})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Destinataire</InputLabel>
              <Select value={formData.receiver_id} onChange={e => setFormData({...formData, receiver_id: e.target.value})} label="Destinataire">
                {users.map(u => <MenuItem key={u.id} value={u.id.toString()}>{u.email} ({u.phone})</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Montant" type="number" margin="dense" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            <TextField fullWidth label="Note (optionnelle)" margin="dense" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleAddTransfer}>Valider</Button>
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

export default Transfers;
