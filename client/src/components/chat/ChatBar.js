import { Paper, Typography, Box, Button } from '@mui/material'
import { useSelector } from 'react-redux'
import ChatIcon from './ChatIcon'

const ChatBar = ({ connections, joinRoom }) => {
  const room = useSelector((state) => state.room)

  return (
    <Paper
      elevation={6}
      sx={{
        height: '75vh',
        overflowY: 'auto',
        borderRadius: 3,
        background: 'linear-gradient(180deg, #fafafa 0%, #f4f4f4 100%)',
      }}
    >
      <Typography
        variant="h6"
        align="center"
        sx={{
          p: 2,
          fontWeight: '600',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        💬 Messages
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
        {connections.map((user) => {
          const isActive = user.connection_id === room
          return (
            <Button
              key={user.connection_id}
              onClick={() => joinRoom(user.connection_id)}
              sx={{
                justifyContent: 'flex-start',
                mb: 0.5,
                p: 1,
                width: '100%',
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: isActive ? '#FF1E56' : 'transparent',
                color: isActive ? '#fff' : '#222',
                '&:hover': {
                  backgroundColor: isActive ? '#ff3366' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ChatIcon
                  username={user.username}
                  image={user.picture_data}
                  size={45}
                />
                <Box sx={{ ml: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user.username}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isActive ? '#fff' : '#777',
                      fontSize: '0.8rem',
                    }}
                  >
                    {user.last_message
                      ? user.last_message.slice(0, 25) + '...'
                      : 'Start chatting'}
                  </Typography>
                </Box>
                {user.online && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                    }}
                  />
                )}
              </Box>
            </Button>
          )
        })}
      </Box>
    </Paper>
  )
}

export default ChatBar
