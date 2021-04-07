import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import Layout from '../../../components/Layout';
import MyHead from '../../../components/MyHead';
import { useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl';

interface Props {}

const EditPost = ({}: Props) => {
    const router = useRouter();
    const [{ data, fetching }] = useGetPostFromUrl();
    const [, updatePost] = useUpdatePostMutation();

    if (fetching)
        return (
            <>
                <MyHead title='Loading..' />
                <Layout variant='md'>Loading...</Layout>
            </>
        );

    if (!data?.post)
        return (
            <>
                <MyHead title='404' />
                <Layout variant='md'>Post not found..</Layout>
            </>
        );
    const post = data.post;

    return (
        <>
            <MyHead title='Edit Post' />
            <Layout variant='lg'>
                <Formik
                    initialValues={{ title: post?.title, text: post?.text }}
                    onSubmit={async values => {
                        await updatePost({ id: post.id, ...values });
                        router.back();
                    }}
                >
                    {({ values, isSubmitting }) => (
                        <Form>
                            <InputField name='title' placeholder='Title' label='Title' />
                            <InputField
                                textarea
                                name='text'
                                label='Body'
                                placeholder='Lorem ispem..'
                                mt={4}
                            />
                            <Button
                                mt={4}
                                isLoading={isSubmitting}
                                type='submit'
                                colorScheme='telegram'
                            >
                                Update Post
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Layout>
        </>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);
