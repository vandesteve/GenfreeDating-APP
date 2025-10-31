import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Container, Paper, Grid, useMediaQuery, Typography, Button } from '@mui/material'
import { addMessage } from '../../reducers/messagesReducer'
import chatService from '../../services/chatService'
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import Loader from '../Loader'
import { changeRoom } from '../../reducers/roomReducer'

const NoConnections = () => (
  <Grid
    container
    spacing={0}
    direction="column"
    alignItems="center"
    justifyContent="center"
    style={{ minHeight: '50vh' }}
  >
    <Paper
      sx={{
        p: 3,
        mt: 2,
        pl: 5,
        pr: 5,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '4rem' }}>😔</Typography>
      <Typography variant="h5" color="#1c1c1c">
        No Connections Yet
      </Typography>
      <Button component={Link} to="/browsing" variant="contained" sx={{ mt: 2 }}>
        Browse Profiles
      </Button>
    </Paper>
  </Grid>
)

const Chat = ({ socket }) => {
  const matches = useMediaQuery('(max-width:650px)')
  const room = useSelector((state) => state.room)
  const user = useSelector((state) => state.user)
  const [connections, setConnections] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()

  // ✅ Join a chat room
  const joinRoom = useCallback(
    (connection_id) => {
      if (!user || !connection_id) return
      socket.emit('leave_room', { room })
      dispatch(changeRoom(connection_id))
      socket.emit('join_room', {
        room: connection_id,
        user_id: user.id,
        username: user.name,
      })
      navigate(`/chat/${connection_id}`)
    },
    [dispatch, navigate, room, socket, user]
  )

  // ✅ Load chat connections on mount
  useEffect(() => {
    const getConnections = async () => {
      try {
        const conns = await chatService.chat_connections()
        setConnections(conns)
      } catch (err) {
        console.error('Failed to load connections:', err)
        setConnections([])
      }
    }
    getConnections()
  }, [])

  // ✅ Auto-join room if param exists
  useEffect(() => {
    if (
      params.id &&
      connections &&
      room !== params.id &&
      connections.find((c) => c.connection_id === Number(params.id))
    ) {
      joinRoom(Number(params.id))
    }
  }, [params.id, connections, room, joinRoom])

  // ✅ Listen for incoming messages
  useEffect(() => {
    socket.on('receive_message', (data) => {
      dispatch(addMessage(data))
    })
    return () => socket.off('receive_message')
  }, [socket, dispatch])

  // ✅ UI States
  if (connections === null) return <Loader text="Loading chat..." />
  if (connections.length === 0) return <NoConnections />

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Grid container spacing={2} direction={matches ? 'column' : 'row'}>
        {/* LEFT SIDEBAR */}
        <Grid item xs={12} md={4}>
          <ChatBar connections={connections} joinRoom={joinRoom} />
        </Grid>

        {/* CHAT WINDOW */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={6}
            sx={{
              height: '75vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 3,
            }}
          >
            <ChatBody connections={connections} />
            <ChatFooter socket={socket} connections={connections} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Chat
