import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { PostSnippetFragment, useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface Props {
    postId: number;
    creatorId: number;
}

const EditDeletePostBtns = ({ postId, creatorId }: Props) => {
    const [, deletePost] = useDeletePostMutation();
    const [{ data }] = useMeQuery();

    if (data?.me?.id !== creatorId) return null;

    return (
        <Flex position='absolute' top={-3} right={-3}>
            <NextLink href='/post/edit/[id]' as={`/post/edit/${postId}`}>
                <IconButton
                    size='s'
                    aria-label='delete post'
                    variant='ghost'
                    icon={<EditIcon color='purple.400' />}
                />
            </NextLink>
            <IconButton
                size='s'
                ml={2}
                aria-label='delete post'
                variant='ghost'
                icon={<DeleteIcon color='red.400' />}
                onClick={() => {
                    deletePost({
                        id: postId,
                    });
                }}
            />
        </Flex>
    );
};

export default EditDeletePostBtns;
