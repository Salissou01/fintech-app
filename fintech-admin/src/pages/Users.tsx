import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, CssBaseline, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, Button, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, TextField, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Snackbar, Alert
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';

const drawerWidth = 240;

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '', photo_id: null as any, selfie: null as any });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, page }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('photo_id', formData.photo_id);
      data.append('selfie', formData.selfie);

      await axios.post('/admin/users', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSnackbar({ open: true, message: 'Utilisateur ajouté avec succès !', severity: 'success' });
      setOpen(false);
      setFormData({ email: '', phone: '', photo_id: null, selfie: null });
      fetchUsers();
    } catch (err) {
      console.error('Erreur ajout utilisateur', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'ajout.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Fintech Admin – Utilisateurs
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
          <ListItemButton>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Utilisateurs" />
          </ListItemButton>
        </List>
        <Divider />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>Liste des utilisateurs</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Recherche"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" color="primary" startIcon={<PersonAddAltIcon />} onClick={() => setOpen(true)}>
            Ajouter utilisateur
          </Button>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Date de Naissance</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Inscription</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.data && users.data.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.identity_number}</TableCell>
                  <TableCell>{user.nom}</TableCell>
                  <TableCell>{user.prenom}</TableCell>
                  <TableCell>{user.date_naissance}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {users.last_page && (
          <Pagination count={users.last_page} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
        )}

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Email" margin="dense" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <TextField fullWidth label="Téléphone" margin="dense" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Button variant="outlined" component="label" fullWidth sx={{ my: 1 }}>
            Sélectionner Photo Identité
            <input type="file" accept="image/*" hidden onChange={e => setFormData({...formData, photo_id: e.target.files?.[0]})} />
            </Button>
            {formData.photo_id && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Fichier sélectionné : {formData.photo_id.name}
            </Typography>
            )}

            <Button variant="outlined" component="label" fullWidth sx={{ my: 1 }}>
            Sélectionner Selfie
            <input type="file" accept="image/*" hidden onChange={e => setFormData({...formData, selfie: e.target.files?.[0]})} />
            </Button>
            {formData.selfie && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Fichier sélectionné : {formData.selfie.name}
            </Typography>
)}

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleAddUser}>Ajouter</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({...snackbar, open: false})}>
          <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Users;
