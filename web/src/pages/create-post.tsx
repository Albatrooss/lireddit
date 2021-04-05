import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import Layout from '../components/Layout';
import MyHead from '../components/MyHead';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost = ({}) => {
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation();
    return (
        <>
            <MyHead title='Create Post' />
            <Layout variant='md'>
                <Formik
                    initialValues={{ title: '', text: '' }}
                    onSubmit={async values => {
                        const { error } = await createPost({ input: values });
                        if (!error) {
                            router.push('/');
                        }
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
                                Create Post
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Layout>
        </>
    );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
