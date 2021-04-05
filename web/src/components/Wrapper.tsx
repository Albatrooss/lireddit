import { Box } from '@chakra-ui/layout';
import React from 'react';
import { WrapperVariant } from '../interfaces';

interface WrapperProps {
    variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant }) => {
    let maxW = '1366px';
    switch (variant) {
        case 'sm':
            maxW = '400px';
            break;
        case 'md':
            maxW = '800px';
            break;
        case 'lg':
            maxW = '1000px';
            break;
    }
    return (
        <Box mt={8} maxW={maxW} w='100%' mx='auto'>
            {children}
        </Box>
    );
};
