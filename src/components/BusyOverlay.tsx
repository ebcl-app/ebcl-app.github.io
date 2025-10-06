import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

type Props = { open: boolean; label?: string };

const BusyOverlay: React.FC<Props> = ({ open, label }) => (
  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }} open={open}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CircularProgress color="inherit" />
      {label && <Typography>{label}</Typography>}
    </Box>
  </Backdrop>
);

export default BusyOverlay;


