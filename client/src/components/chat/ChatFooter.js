import { Button, TextField, Box, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useState } from 'react'
import { useSelector } from 'react-redux'

const ChatFooter = ({ socket, connections }) => {
  const [message, setMessage] = useState('')
  const room = useSelector((state) => state.room)
  const user = useSelector((state) => state.user)

  if (room === '') return null
  const receiver_user = connections.find((u) => u.connection_id === room)
  if (!receiver_user) return null

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && user) {
      socket.emit('send_message', {
        text: message,
        sender_id: user.id,
        receiver_id: receiver_user.id,
        name: user.name,
        room,
        key: `${user.id}-${room}-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
      setMessage('')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        p: 1.5,
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
      }}
      component="form"
      onSubmit={handleSendMessage}
    >
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        size="small"
        sx={{
          backgroundColor: 'white',
          borderRadius: '30px',
          '& fieldset': { border: 'none' },
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          input: { px: 2 },
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e)
        }}
      />

      <IconButton
        type="submit"
        color="primary"
        sx={{
          backgroundColor: '#0078ff',
          color: '#fff',
          '&:hover': { backgroundColor: '#005fcc' },
          p: 1.5,
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  )
}

export default ChatFooter
