import { useSelector, useDispatch } from 'react-redux'
import { Typography, Box, Paper, Fade } from '@mui/material'
import ChatIcon from './ChatIcon'
import chatService from '../../services/chatService'
import { useEffect, useRef } from 'react'
import { setMessages } from '../../reducers/messagesReducer'

const ChatBody = ({ connections }) => {
  const profileData = useSelector(state => state.profile)
  const room = useSelector(state => state.room)
  const user = useSelector(state => state.user)
  const messages = useSelector(state => state.messages)
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)

  // Fetch messages when joining room
  useEffect(() => {
    if (room !== '') {
      chatService.getRoomMessages(room).then(data => dispatch(setMessages(data)))
    }
  }, [room, dispatch])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (room === '') {
    return (
      <Typography
        variant="h5"
        align="center"
        sx={{ p: 4, color: '#999', fontWeight: 500 }}
      >
        💬 Select a chat to start messaging
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        height: '65vh',
        overflowY: 'auto',
        px: 2,
        py: 2,
        backgroundColor: '#fdfdfd',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Box sx={{ mb: 3, textAlign: 'center', color: '#777' }}>
        <Typography variant="body2">
          Chatting with{' '}
          {
            connections.find(c => c.connection_id === room)?.username ||
            `room #${room}`
          }
        </Typography>
      </Box>

      {messages.map((message, index) => {
        const isUser = message.sender_id === user.id || message.name === user.name

        // get correct sender (you or receiver)
        const sender = isUser
          ? {
              username: user.name,
              picture:
                profileData?.profile_pic?.picture_data ||
                profileData?.picture_data ||
                profileData?.profile_pic,
            }
          : connections.find(u => u.username === message.name)

        const senderPic =
          sender?.picture ||
          sender?.profile_pic?.picture_data ||
          sender?.picture_data ||
          '/default-avatar.png'

        return (
          <Fade in key={index}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                mb: 1.5,
                alignItems: 'flex-end',
              }}
            >
              {!isUser && (
                <ChatIcon username={sender?.username} image={senderPic} />
              )}

              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  ml: isUser ? 0 : 1,
                  mr: isUser ? 1 : 0,
                  borderRadius: 3,
                  backgroundColor: isUser ? '#dcf8c6' : '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    wordWrap: 'break-word',
                    fontSize: '0.95rem',
                    color: '#333',
                  }}
                >
                  {message.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: isUser ? 'right' : 'left',
                    color: '#999',
                    mt: 0.5,
                  }}
                >
                  {message.time || ''}
                </Typography>
              </Paper>

              {isUser && (
                <ChatIcon username={sender?.username} image={senderPic} />
              )}
            </Box>
          </Fade>
        )
      })}

      <div ref={messagesEndRef} />
    </Box>
  )
}

export default ChatBody
