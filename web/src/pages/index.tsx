import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useMeQuery, usePostsQuery } from '../generated/graphql';
import MyHead from '../components/MyHead';
import Layout from '../components/Layout';
import { Heading, Stack, Text } from '@chakra-ui/layout';
import { Wrapper } from '../components/Wrapper';
import HomePost from '../components/HomePost';
import { Button } from '@chakra-ui/button';
import { useState } from 'react';

interface Varibale {
    limit: number;
    cursor: string | null;
}

const Index = () => {
    const [variables, setVariables] = useState<Varibale>({ limit: 15, cursor: null });
    const [{ data, fetching }] = usePostsQuery({
        variables,
    });

    const [{ data: meData }] = useMeQuery();

    console.log('data', data);
    if (!fetching && !data) {
        return <div> You got query failed for some reason..</div>;
    }
    return (
        <>
            <MyHead title='Home' />
            <Layout>
                <Heading textAlign='center'>Posts</Heading>
                <br />
                <Wrapper variant='md'>
                    <Stack spacing={8}>
                        {!data && fetching ? (
                            <div>Loading..</div>
                        ) : (
                            data!.posts.posts.map(p =>
                                !p ? null : <HomePost key={p.id} userId={meData?.me?.id} post={p} />
                            )
                        )}
                    </Stack>
                    {data && data.posts.hasMore ? (
                        <Button
                            m={8}
                            display='block'
                            mx='auto'
                            onClick={() => {
                                setVariables({
                                    limit: variables.limit,
                                    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                                });
                            }}
                        >
                            Load More...
                        </Button>
                    ) : (
                        <Text color='gray' textAlign='center' m={8}>
                            all out of posts..
                        </Text>
                    )}
                </Wrapper>
            </Layout>
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
