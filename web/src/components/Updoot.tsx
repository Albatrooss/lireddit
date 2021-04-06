import { TriangleUpIcon, TriangleDownIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useDeletePostMutation, useVoteMutation } from '../generated/graphql';
import NextLink from 'next/link';

interface Props {
    post: PostSnippetFragment;
    userId: number;
}

const Updoot = ({ post, userId }: Props) => {
    const [loadingState, setLoadingState] = useState<'up' | 'down' | null>(null);
    const [, vote] = useVoteMutation();
    const [, deletePost] = useDeletePostMutation();
    return (
        <Flex flexDir='column' height='100%' justifyContent='center' position='relative' pt={4}>
            {post.creator.id === userId ? (
                <Flex position='absolute' top={-3} right={-3}>
                    <NextLink href='/post/edit/[id]' as={`/post/edit/${post.id}`}>
                        <IconButton
                            size='s'
                            aria-label='delete post'
                            // colorScheme='purple'
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
                                id: post.id,
                            });
                        }}
                    />
                </Flex>
            ) : null}
            <IconButton
                aria-label='UpDoot'
                icon={<TriangleUpIcon size={12} color={post.voteStatus === 1 ? 'green.200' : ''} />}
                variant='ghost'
                size='sm'
                fontSize='x-large'
                isLoading={loadingState === 'up'}
                onClick={async () => {
                    if (post.voteStatus === 1) return;
                    setLoadingState('up');
                    await vote({
                        value: 1,
                        postId: post.id,
                    });
                    setLoadingState(null);
                }}
            />
            <Text textAlign='center' fontSize='lg' fontWeight='bold' lineHeight='short'>
                {post.points}
            </Text>
            <IconButton
                aria-label='DownDoot'
                icon={<TriangleDownIcon size={12} color={post.voteStatus === -1 ? 'tomato' : ''} />}
                variant='ghost'
                size='sm'
                fontSize='x-large'
                isLoading={loadingState === 'down'}
                onClick={async () => {
                    if (post.voteStatus === -1) return;
                    setLoadingState('down');
                    await vote({
                        value: -1,
                        postId: post.id,
                    });
                    setLoadingState(null);
                }}
            />
        </Flex>
    );
};

export default Updoot;
