import React from 'react';
import { Box, Card, CardContent } from '@mui/material';
import { appVersion } from '../version';

export default function SettingsPage(){
    return (
        <Box>
            Version: {appVersion}
        </Box>
    )
};