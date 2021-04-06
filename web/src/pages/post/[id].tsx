import { Box, Divider, Heading, Text } from '@chakra-ui/layout';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../components/Layout';
import MyHead from '../../components/MyHead';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const Post = () => {
    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const [{ data, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId,
        },
    });
    if (fetching)
        return (
            <>
                <MyHead />
                <Layout variant='md'>Loading..</Layout>
            </>
        );

    if (!data?.post)
        return (
            <>
                <MyHead title='404' />
                <Layout variant='md'>Post not found..</Layout>
            </>
        );

    return (
        <>
            <MyHead title={data?.post?.title} />
            <Layout variant='lg'>
                <Heading>{data?.post?.title}</Heading>
                <Heading mt={4} size='md' textTransform='capitalize' color='gray.600'>
                    by {data?.post?.creator.username}
                </Heading>
                <Divider my={4} />
                <Text>{data?.post?.text}</Text>
            </Layout>
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
