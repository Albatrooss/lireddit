import { IconButton } from '@chakra-ui/react';
import Icon from '@chakra-ui/icon';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, Text } from '@chakra-ui/layout';
import React from 'react';
import { Post, PostSnippetFragment } from '../generated/graphql';
import Updoot from './Updoot';

interface Props {
    post: PostSnippetFragment;
}

const HomePost = ({ post, ...rest }: Props) => {
    const { title, creator, textSnippet } = post;
    return (
        <Box
            p={5}
            shadow='md'
            borderWidth='1px'
            borderColor='Background'
            borderRadius={2}
            {...rest}
        >
            <Flex justifyContent='space-between' alignItems='center' height='max'>
                <Box>
                    <Heading fontSize='xl'>{title}</Heading>
                    <Text textTransform='capitalize'>Posted by {creator.username}</Text>
                    <Text mt={4}>{textSnippet}</Text>
                </Box>
                <Updoot post={post} />
            </Flex>
        </Box>
    );
};

export default HomePost;
