import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import signUpService from '../services/signUpService';
import { setUser } from '../reducers/userReducer';
import { changeNotification } from '../reducers/notificationReducer';
import { changeSeverity } from '../reducers/severityReducer';
import { getProfileData } from '../reducers/profileReducer';
import { getUserLists } from '../reducers/userListsReducer';
import { getUserNotifications } from '../reducers/userNotificationsReducer';
import { Typography, Button, Paper, TextField, Box } from '@mui/material';
import { Container } from '@mui/system';
import { createTheme } from '@mui/material/styles';
import { ReactComponent as HeartIcon } from '../images/matcha_icon_with_heart.svg';
import Notification from './Notification';
import coupleImage from '../images/couples.jpg'; // Local couple image

const Login = ({ socket }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitUser = async (event) => {
        event.preventDefault();

        const signedUpUser = {
            username: event.target.username.value,
            password: event.target.password.value
        };

        signUpService.logInUser(signedUpUser).then((result) => {
            if (result.userid) {
                const sessionUser = { name: result.username, id: result.userid };
                dispatch(setUser(sessionUser));
                dispatch(getUserLists());
                dispatch(getUserNotifications());
                dispatch(getProfileData());
                dispatch(changeNotification(""));
                socket.emit("newUser", { name: result.username, id: result.userid, socketID: socket.id });
                socket.emit("join_notification", { id: result.userid });
            } else {
                dispatch(changeSeverity('error'));
                dispatch(changeNotification(result));
            }
        });
    };

    const navigateToReset = () => {
        navigate('/login/resetpassword');
    };

    const navigateToSignup = () => {
        navigate('/signup'); // Adjust path if your signup route is different
    };

    const theme = createTheme({
        palette: {
            primary: {
                main: '#FF4081', // Match lightbox and .userprofilepic
            },
            secondary: {
                main: '#F5F5F5',
            },
        }
    });

    const imageStyle = {
        width: '100px',
        display: 'relative',
        marginLeft: 'calc(50% + 5px)',
        transform: 'translate(-50%)',
        filter: 'drop-shadow(0px 0px 3px rgba(255, 64, 129, 0.8))', // Pink shadow
    };

    const coupleImageStyle = {
        width: '100%',
        maxWidth: '300px', // Responsive size
        height: 'auto',
        borderRadius: '10px',
        border: '3px solid #FF4081', // Match lightbox
        boxShadow: '0 4px 10px rgba(255, 64, 129, 0.3)', // Match lightbox
        margin: '0 auto 20px', // Center with spacing
        display: 'block',
    };

    return (
        <Container maxWidth='sm' sx={{ pt: 5, pb: 5 }}>
            <Paper elevation={10} sx={{ padding: 3, backgroundColor: '#fff5f8' }}> {/* Light pink background */}
                <Box sx={{ textAlign: 'center' }}>
                    <img
                        src={coupleImage}
                        alt="Romantic couple"
                        style={coupleImageStyle}
                    />
                    <HeartIcon style={imageStyle} />
                </Box>
                <Typography variant='h5' align='center' sx={{ fontWeight: 550, color: '#FF4081' }}>
                    Login
                </Typography>
                <Typography align='center' sx={{ mb: 4, color: '#FF4081' }}>
                    Login and start dating now!
                </Typography>
                <form onSubmit={submitUser}>
                    <TextField
                        fullWidth
                        margin='normal'
                        name="username"
                        label='Username or e-mail address'
                        placeholder="Username or email address"
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: '#FF4081' },
                                '&.Mui-focused fieldset': { borderColor: '#FF4081' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#FF4081' },
                        }}
                    />
                    <TextField
                        fullWidth
                        margin='dense'
                        type="password"
                        name="password"
                        label='Password'
                        placeholder="Password"
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: '#FF4081' },
                                '&.Mui-focused fieldset': { borderColor: '#FF4081' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#FF4081' },
                        }}
                    />
                    <Button
                        type='submit'
                        variant='contained'
                        theme={theme}
                        size='large'
                        sx={{ mt: 1, backgroundColor: '#FF4081', '&:hover': { backgroundColor: '#F50057' } }}
                    >
                        Submit
                    </Button>
                </form>
                <Button
                    onClick={navigateToReset}
                    sx={{ mt: 1, color: '#FF4081', '&:hover': { color: '#F50057' } }}
                >
                    Forgot Password
                </Button>
                <Button
                    onClick={navigateToSignup}
                    sx={{ mt: 1, ml: 2, color: '#FF4081', '&:hover': { color: '#F50057' } }}
                >
                    Do you have an account? Sign in.
                </Button>
                <Notification />
            </Paper>
        </Container>
    );
};

export default Login;