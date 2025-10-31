import { Box, Avatar } from '@mui/material';
import AspectRatio from '@mui/joy/AspectRatio';
import { useSelector } from 'react-redux';

const UserAvatar = ({ userData, onClick, sx }) => {
    const onlineUsers = useSelector(state => state.onlineUsers);
    const usernames = onlineUsers.map(user => user.name);
    const profile_pic = userData.profile_pic['picture_data'];

    return (
        <Box sx={{ width: '200px', display: 'inline-block' }}>
            <AspectRatio ratio={1}>
                <Avatar
                    src={profile_pic}
                    alt={`${userData.username}'s profile`}
                    className="userprofilepic" // Apply existing CSS for pink border
                    sx={{
                        border: usernames.includes(userData.username) ? 4 : 0,
                        borderColor: usernames.includes(userData.username) ? 'rgb(68, 183, 0)' : 'transparent',
                        filter: usernames.includes(userData.username) ? 'drop-shadow(0px 0px 1px rgb(68, 183, 0))' : 'none',
                        cursor: 'pointer', // Indicate clickability
                        ...sx, // Allow additional styles from parent
                    }}
                    onClick={onClick} // Pass click handler for lightbox
                />
            </AspectRatio>
        </Box>
    );
};

export default UserAvatar;