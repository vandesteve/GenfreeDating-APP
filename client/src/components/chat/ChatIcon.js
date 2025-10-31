import { useSelector } from 'react-redux'
import { Avatar, Tooltip, styled, Badge } from '@mui/material'

const ChatIcon = ({ username, image, size = 45 }) => {
  const onlineUsers = useSelector(state => state.onlineUsers)
  const usernames = onlineUsers.map(user => user.name)

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': { transform: 'scale(.8)', opacity: 1 },
      '100%': { transform: 'scale(2.4)', opacity: 0 },
    },
  }))

  const avatar = (
    <Avatar
      src={image || ''}
      alt={username}
      sx={{
        width: size,
        height: size,
        border: '2px solid #fff',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        bgcolor: '#f48fb1',
        fontWeight: 600,
        '&:hover': {
          boxShadow: '0 0 10px rgba(255,30,86,0.4)',
          transform: 'scale(1.05)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      {!image && username ? username[0].toUpperCase() : ''}
    </Avatar>
  )

  const isOnline = usernames.includes(username)

  return (
    <Tooltip title={`${username} ${isOnline ? '(Online)' : '(Offline)'}`} arrow>
      {isOnline ? (
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {avatar}
        </StyledBadge>
      ) : (
        avatar
      )}
    </Tooltip>
  )
}

export default ChatIcon
