import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Button, Paper, Box, Grid, Rating, styled, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, TextField
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import AspectRatio from '@mui/joy/AspectRatio';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Container } from '@mui/system';
import Notification from './Notification';
import { changeNotification } from '../reducers/notificationReducer';
import { changeSeverity } from '../reducers/severityReducer';
import { getProfileData } from '../reducers/profileReducer';
import profileService from '../services/profileService';
import ProfileSetUpForm from './profile/ProfileSetUpForm';
import Loader from './Loader';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import '../css/Lightbox.css'; // Import the lightbox CSS (Option 1)

// 🎨 Styled Rating (for hearts)
const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': { color: '#ff6d75' },
  '& .MuiRating-iconHover': { color: '#ff3d47' },
});

// 🧩 Small component for label + data
const ProfileInput = ({ text, input }) => (
  <Grid item xs={12} sm={6}>
    <Typography sx={{ width: 170, display: 'inline-block', fontWeight: 700 }}>
      {text}
    </Typography>
    <Typography sx={{ display: 'inline' }}>{input}</Typography>
  </Grid>
);

// ⋯ Picture Menu
const PictureMenu = ({ pictureId, pictureData, setProfilePicture, deleteImage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        sx={{ position: 'absolute', top: 5, right: 5, color: 'white', background: 'rgba(0,0,0,0.4)' }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setProfilePicture(pictureId, pictureData);
          }}
        >
          Add as Profile
        </MenuItem>
        <MenuItem
          sx={{ color: 'red' }}
          onClick={() => {
            setAnchorEl(null);
            deleteImage(pictureId);
          }}
        >
          Delete Image
        </MenuItem>
      </Menu>
    </>
  );
};

const Profile = () => {
  const [isLoading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [mobile, setMobile] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null); // State for lightbox image
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileData = useSelector(state => state.profile);
  const userId = profileData?.id;

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getProfileData());
      if (profileData?.id) await loadWallet();
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  const loadWallet = async () => {
    try {
      const resBal = await axios.get(`/api/wallet/${userId}`);
      setBalance(resBal.data.balance || 0);
      const resTx = await axios.get(`/api/wallet/${userId}/transactions`);
      setTransactions(resTx.data || []);
    } catch (err) {
      console.error('Wallet load failed:', err);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0 || !mobile) {
      dispatch(changeSeverity('error'));
      dispatch(changeNotification('Enter valid amount and mobile number.'));
      return;
    }
    try {
      await axios.post(`/api/wallet/deposit`, {
        user_id: userId,
        amount: parseFloat(depositAmount),
        mobile: mobile
      });
      dispatch(changeSeverity('success'));
      dispatch(changeNotification('Deposit successful!'));
      setDepositAmount('');
      setMobile('');
      loadWallet();
    } catch (err) {
      console.error('Deposit failed:', err);
      dispatch(changeSeverity('error'));
      dispatch(changeNotification('Failed to deposit funds.'));
    }
  };

  // Lightbox toggle functions
  const openLightbox = (src) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  if (isLoading) return <Loader text="Getting profile data..." />;
  if (!profileData.id) return <ProfileSetUpForm />;

  const profile_pic = profileData.profile_pic['picture_data'];
  const other_pictures = profileData.other_pictures || [];

  const ProfileData = {
    'First name:': profileData.firstname,
    'Last name:': profileData.lastname,
    'Email address:': profileData.email,
    'Gender:': profileData.gender,
    'Age:': profileData.age,
    'Sexual preference:': profileData.sexual_pref,
    'Location:': profileData.user_location,
    'GPS:': Object.values(profileData.ip_location).join(', '),
    'Tags:': profileData.tags.join(', '),
  };

  const deleteImage = async (id) => {
    if (window.confirm('Delete this picture?')) {
      await profileService.deletePicture(id);
      dispatch(getProfileData());
    }
  };

  const uploadImage = async (event) => {
    const image = event.target.files[0];
    if (!image) return;
    if (image.size > 5242880) {
      dispatch(changeSeverity('error'));
      dispatch(changeNotification('Max image size is 5 MB.'));
      return;
    }
    const formData = new FormData();
    formData.append('file', image);
    const result = await profileService.uploadPicture(formData);
    if (result === true) {
      dispatch(getProfileData());
      dispatch(changeSeverity('success'));
      dispatch(changeNotification('Image uploaded!'));
    } else {
      dispatch(changeSeverity('error'));
      dispatch(changeNotification(result));
    }
  };

  const setProfilePicture = async (id, data) => {
    await profileService.setProfilePicById(id, data);
    dispatch(getProfileData());
    dispatch(changeSeverity('success'));
    dispatch(changeNotification('Profile picture updated!'));
  };

  const deleteUser = () => {
    if (window.confirm('Delete your account permanently?')) navigate('/deleteuser');
  };

  return (
    <Container maxWidth="md" sx={{ pt: 5, pb: 5 }}>
      <Paper elevation={10} sx={{ padding: 3 }}>
        {/* 🧍 Header */}
        <Grid container justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
          <Box sx={{ width: 200 }}>
            <AspectRatio ratio={1}>
              <Avatar
                src={profile_pic}
                alt="profile"
                sx={{ width: '100%', height: '100%', cursor: 'pointer' }}
                onClick={() => openLightbox(profile_pic)} // Open lightbox on click
                className="userprofilepic"
              />
            </AspectRatio>
          </Box>
          <Box sx={{ ml: 5 }}>
            <Typography variant="h4">{profileData.username}</Typography>
            <Typography variant="h6">Rating: {profileData.total_pts}</Typography>
            <StyledRating
              name="read-only"
              value={profileData.total_pts / 20}
              precision={0.5}
              icon={<FavoriteIcon fontSize="inherit" />}
              emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
              readOnly
            />
          </Box>
        </Grid>

        {/* 💰 Wallet */}
        <Box sx={{ mt: 3, mb: 3, p: 2, borderRadius: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
          <Typography variant="h6">Available Balance</Typography>
          <Typography variant="h4" color="primary">
            KSh {balance.toFixed(2)}
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(e, val) => setTab(val)} centered sx={{ mb: 3 }}>
          <Tab label="Profile Info" />
          <Tab label="Wallet Transactions" />
          <Tab label="Deposit Funds" />
        </Tabs>

        {tab === 0 && (
          <>
            {/* ⚙️ Action Buttons */}
            <Box sx={{ mb: 4 }}>
              <Button onClick={() => navigate('/settings')} sx={{ mr: 2 }} variant="contained">
                Edit Profile
              </Button>
              <Button onClick={() => navigate('/changepassword')} sx={{ mr: 2 }} variant="outlined">
                Change Password
              </Button>
              <Button variant="contained" color="error" onClick={deleteUser}>
                Delete Account
              </Button>
            </Box>

            {/* 🏞️ Pictures */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: '700' }}>
              My Pictures
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {other_pictures.map((picture, i) => (
                <Grid item xs={6} sm={4} md={3} key={i}>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={picture.picture_data}
                      alt="profile"
                      style={{
                        width: '100%', height: '150px',
                        objectFit: 'cover', borderRadius: '10px', cursor: 'pointer',
                      }}
                      onClick={() => openLightbox(picture.picture_data)} // Open lightbox on click
                      className="userprofilepic"
                    />
                    <PictureMenu
                      pictureId={picture.picture_id}
                      pictureData={picture.picture_data}
                      setProfilePicture={setProfilePicture}
                      deleteImage={deleteImage}
                    />
                  </Box>
                </Grid>
              ))}
              <Grid item xs={6} sm={4} md={3}>
                <label
                  htmlFor="image-upload"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '150px', border: '2px dashed #FF4081', // Updated to match lightbox
                    borderRadius: '10px', cursor: 'pointer',
                    color: '#FF4081', fontWeight: 600
                  }}
                  className="styled-image-upload"
                >
                  + Add Picture
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={uploadImage}
                  style={{ display: 'none' }}
                />
              </Grid>
            </Grid>

            {/* 🧭 Profile Info */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {Object.keys(ProfileData).map((key, index) => (
                <ProfileInput key={index} text={key} input={ProfileData[key]} />
              ))}
            </Grid>

            {/* 🏷 Categories */}
            {profileData.categories?.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.categories.map((cat, i) => (
                    <Box
                      key={i}
                      sx={{
                        bgcolor: '#fff5f8', // Updated to match lightbox
                        px: 2, py: 1,
                        borderRadius: 2, fontWeight: 600
                      }}
                    >
                      {cat}
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* 📊 Profile Activity */}
            <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: '700' }}>
              Profile Activity
            </Typography>
            <Paper sx={{ overflow: 'hidden', mb: 3 }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fff5f8' }}> {/* Updated to match lightbox */}
                    <th style={{ padding: '10px', textAlign: 'left' }}>Profile</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Username</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Relation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...profileData.liked.map(u => ({
                      id: u.target_id, username: u.username, relation: 'You Liked', pic: u.profile_pic
                    })),
                    ...profileData.likers.map(u => ({
                      id: u.liker_id, username: u.username, relation: 'Liked You', pic: u.profile_pic
                    })),
                    ...profileData.watchers.map(u => ({
                      id: u.watcher_id, username: u.username, relation: 'Watched You', pic: u.profile_pic
                    }))
                  ].map((user, i) => (
                    <tr
                      key={i}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => navigate(`/profile/${user.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff0f4'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px' }}>
                        <Avatar
                          src={user.pic || '/default-avatar.png'}
                          sx={{ width: 40, height: 40, cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigating to profile
                            openLightbox(user.pic || '/default-avatar.png');
                          }}
                          className="userprofilepic"
                        />
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{user.username}</td>
                      <td style={{ padding: '10px', color: '#FF4081' }}>{user.relation}</td> {/* Updated to match lightbox */}
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Paper>

            {/* 🌐 Social Links */}
            {profileData.socials && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Social Profiles
                </Typography>
                {Object.entries(profileData.socials).map(([platform, handle]) => (
                  <Typography key={platform}>
                    <strong>{platform}:</strong> {handle}
                  </Typography>
                ))}
              </Box>
            )}
          </>
        )}

        {tab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Transaction History</Typography>
            {transactions.length === 0 ? (
              <Typography>No transactions yet.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount (KSh)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                        <TableCell>{tx.transaction_type}</TableCell>
                        <TableCell align="right">{tx.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Deposit Funds (M-Pesa)</Typography>
            <TextField
              label="Mobile Number (07xxxxxxxx)"
              fullWidth
              sx={{ mt: 2 }}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <TextField
              label="Amount (KSh)"
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{ mt: 2, backgroundColor: '#FF4081', '&:hover': { backgroundColor: '#F50057' } }} // Match lightbox
              onClick={handleDeposit}
            >
              Deposit
            </Button>
          </Box>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <div className={`lightbox ${lightboxImage ? 'active' : ''}`}>
            <span className="close-btn" onClick={closeLightbox} aria-label="Close lightbox">
              &times;
            </span>
            <img src={lightboxImage} alt="Lightbox Image" />
          </div>
        )}
      </Paper>
      <Notification />
    </Container>
  );
};

export default Profile;