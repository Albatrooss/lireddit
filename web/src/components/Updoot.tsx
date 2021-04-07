import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useDeletePostMutation, useVoteMutation } from '../generated/graphql';
import EditDeletePostBtns from './EditDeletePostBtns';

interface Props {
    post: PostSnippetFragment;
}

const Updoot = ({ post }: Props) => {
    const [loadingState, setLoadingState] = useState<'up' | 'down' | null>(null);
    const [, vote] = useVoteMutation();
    return (
        <Flex flexDir='column' height='100%' justifyContent='center' position='relative' pt={4}>
            <EditDeletePostBtns postId={post.id} creatorId={post.creator.id} />
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
