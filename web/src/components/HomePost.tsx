import { Box, Heading, Text } from '@chakra-ui/layout';
import React from 'react';
import { Post } from '../generated/graphql';

interface Props {
    title: string;
    desc: string;
}

const HomePost = ({ title, desc, ...rest }: Props) => {
    return (
        <Box
            p={5}
            shadow='md'
            borderWidth='1px'
            borderColor='Background'
            borderRadius={2}
            {...rest}
        >
            <Heading fontSize='xl' ml={8}>
                {title}
            </Heading>
            <Text mt={4}>{desc}</Text>
        </Box>
    );
};

export default HomePost;
