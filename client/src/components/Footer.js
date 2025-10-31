import { Box, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Instagram, Twitter, YouTube, Email } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#FF1E56',
        color: 'white',
        py: 4,
        textAlign: 'center',
        mt: 'auto',
      }}
    >
      {/* --- Links --- */}
      <Box sx={{ mb: 2 }}>
        <Link href="/about" underline="none" color="inherit" sx={{ mx: 2, fontWeight: 500 }}>
          About Us
        </Link>
        <Link href="/contact" underline="none" color="inherit" sx={{ mx: 2, fontWeight: 500 }}>
          Contact Us
        </Link>
        <Link href="/terms" underline="none" color="inherit" sx={{ mx: 2, fontWeight: 500 }}>
          Terms & Conditions
        </Link>
        <Link href="/privacy" underline="none" color="inherit" sx={{ mx: 2, fontWeight: 500 }}>
          Privacy Policy
        </Link>
      </Box>

      {/* --- Social Icons --- */}
      <Box sx={{ mb: 2 }}>
        <IconButton href="https://facebook.com" target="_blank" sx={{ color: 'white' }}>
          <Facebook />
        </IconButton>
        <IconButton href="https://instagram.com" target="_blank" sx={{ color: 'white' }}>
          <Instagram />
        </IconButton>
        <IconButton href="https://twitter.com" target="_blank" sx={{ color: 'white' }}>
          <Twitter />
        </IconButton>
        <IconButton href="https://youtube.com" target="_blank" sx={{ color: 'white' }}>
          <YouTube />
        </IconButton>
        <IconButton href="mailto:support@genfree.com" sx={{ color: 'white' }}>
          <Email />
        </IconButton>
      </Box>

      {/* --- Copyright --- */}
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        © {new Date().getFullYear()} <strong>GenFree Dating App</strong> — Find Love, Find You 💗
      </Typography>
    </Box>
  );
};

export default Footer;
