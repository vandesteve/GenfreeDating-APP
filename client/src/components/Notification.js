import { Alert, Snackbar } from "@mui/material";
import { useSelector, useDispatch } from 'react-redux';
import { changeNotification } from '../reducers/notificationReducer';

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(state => state.notification);
  const severity = useSelector(state => state.severity);

  const handleClose = () => {
    dispatch(changeNotification(''));
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={5000} // hides after 5 seconds
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {notification}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
