import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { getStringService } from '../../bootstrap/services/string-service';

export default function FooterStrip() {
  const strings = getStringService();

  return (
    <Box
      sx={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        pt: 2,
        mt: 4,
        mb: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Typography variant='caption' sx={{ opacity: 0.6 }}>
          {strings.getLabel('footer_text')}
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap'>
          <Chip
            label={strings.getLabel('crt_shader')}
            size='small'
            variant='outlined'
            sx={{ fontSize: 9 }}
          />
          <Chip
            label={strings.getLabel('netplay')}
            size='small'
            variant='outlined'
            sx={{ fontSize: 9 }}
          />
          <Chip
            label={strings.getLabel('big_screen_mode')}
            size='small'
            variant='outlined'
            sx={{ fontSize: 9 }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
