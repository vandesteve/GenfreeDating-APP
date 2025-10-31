import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import {
  AppBar, Container, Toolbar, Box, IconButton,
  Menu, MenuItem, Button, Badge, Avatar, Card, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ReactComponent as Logo } from '../../images/matcha_logo.svg';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import UserMenu from './UserMenu';
import profileService from '../../services/profileService';
import {
  addUserNotification,
  setNotificationRead,
  setAllNotificationsRead,
  clearUserNotifications,
  deleteUserNotification
} from '../../reducers/userNotificationsReducer';

const navbar_theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#FF1E56',
    },
  }
});

const NavBar = ({ socket }) => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const allNotifications = useSelector(state => state.userNotifications);
  const unreadNotifications = allNotifications.filter(n => n.read === 'NO');
  const dispatch = useDispatch();

  // ✅ Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Real-time notifications
  useEffect(() => {
    socket.on('new_notification', (data) => {
      dispatch(addUserNotification(data));
    });
    return () => socket.off('new_notification');
  }, [socket, dispatch]);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseNotifications = () => setAnchorElNotifications(null);

  // ✅ Handle category click
  const handleCategoryClick = (cat) => {
    if (cat.allow_login && (!user || user === '')) {
      alert('Please log in to access this category.');
      navigate('/login');
      return;
    }
    navigate(`/browsing/${cat.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  // ✅ Handle notification click
  const handleNotificationClick = (id, redirect_path) => {
    if (redirect_path) handleCloseNotifications();
    profileService.readNotification(id);
    dispatch(setNotificationRead(id));
    if (redirect_path) navigate(redirect_path);
  };

  // ✅ Static pages
  let staticPages = {};
  if (!user || user === '') {
    staticPages = { 'Login': '/login', 'Signup': '/signup' };
  } else {
    staticPages = {
      'Profile': '/profile',
      'Chat': '/chat',
      'Go Premium': '/premium',
      'Log Out': '/logout'
    };
  }

  return (
    <AppBar position="static" color="primary" elevation={0} theme={navbar_theme}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ backgroundColor: '#fff', color: '#FF1E56' }}>
          {/* Logo - Desktop */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: { xs: 'none', md: 'flex' },
              height: '40px',
              mr: 4
            }}
          >
            <Logo />
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} onClick={() => { handleCategoryClick(cat); handleCloseNavMenu(); }}>
                  {cat.name}
                </MenuItem>
              ))}
              {Object.keys(staticPages).map((page) => (
                <MenuItem key={page} component={Link} to={staticPages[page]} onClick={handleCloseNavMenu}>
                  {page}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Box
            component={Link}
            to="/"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, height: '40px' }}
          >
            <Logo />
          </Box>

          {/* Desktop Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                sx={{
                  mr: 2,
                  color: '#FF1E56',
                  textTransform: 'capitalize',
                  '&:hover': { backgroundColor: '#ffe6eb' }
                }}
              >
                {cat.name}
              </Button>
            ))}
            {Object.keys(staticPages).map((page) => (
              <Button
                key={page}
                component={Link}
                to={staticPages[page]}
                sx={{
                  mr: 2,
                  color: '#FF1E56',
                  textTransform: 'capitalize',
                  '&:hover': { backgroundColor: '#ffe6eb' }
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Notifications + User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* 🔔 Notification Menu */}
            <Badge
              color="error"
              overlap="circular"
              badgeContent={unreadNotifications.length || null}
              sx={{ mr: 2 }}
            >
              <IconButton
                sx={{
                  backgroundColor: '#FF1E56',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#e01b4c' }
                }}
                onClick={(e) => setAnchorElNotifications(e.currentTarget)}
              >
                <NotificationsIcon />
              </IconButton>
            </Badge>

            <Menu
              anchorEl={anchorElNotifications}
              open={Boolean(anchorElNotifications)}
              onClose={handleCloseNotifications}
              sx={{ mt: '45px' }}
            >
              <Box sx={{ p: 1, maxHeight: 400, overflowY: 'auto' }}>
                {allNotifications.length === 0 && (
                  <Typography sx={{ p: 2, textAlign: 'center' }}>No new notifications</Typography>
                )}

                {allNotifications.map((n, i) => (
                  <Card
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      backgroundColor: n.read === 'NO' ? '#ffe6eb' : '#fafafa'
                    }}
                  >
                    <Badge
                      color="error"
                      variant={n.read === 'NO' ? 'dot' : undefined}
                      overlap="circular"
                      sx={{ mr: 1 }}
                    >
                      <Avatar src={n.picture} alt="user_picture" />
                    </Badge>

                    <Typography
                      onClick={() => handleNotificationClick(n.id, n.redirect_path)}
                      component={n.redirect_path ? Link : 'div'}
                      to={n.redirect_path}
                      sx={{
                        flexGrow: 1,
                        color: '#000',
                        textDecoration: 'none',
                        fontSize: '0.9rem'
                      }}
                    >
                      {n.text}
                    </Typography>

                    <IconButton size="small" onClick={() => dispatch(deleteUserNotification(n.id))}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>
              {allNotifications.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, pb: 1 }}>
                  <Button onClick={() => dispatch(clearUserNotifications())} size="small" color="secondary">
                    Clear all
                  </Button>
                  <Button onClick={() => dispatch(setAllNotificationsRead())} size="small" color="secondary">
                    Mark all read
                  </Button>
                </Box>
              )}
            </Menu>

            {/* 👤 User Menu */}
            <UserMenu user={user} socket={socket} />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
