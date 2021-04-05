import React from 'react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Button } from '@chakra-ui/button';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { Box, Flex, Heading, Link } from '@chakra-ui/layout';
import NextLink from 'next/link';
import MyHead from '../components/MyHead';

const Login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();

    return (
        <>
            <MyHead title='Login' />
            <Wrapper variant='sm'>
                <Heading mb={4} textAlign='center' color='telegram.900'>
                    Login
                </Heading>
                <Formik
                    initialValues={{ usernameOrEmail: '', password: '' }}
                    onSubmit={async (values, { setErrors }) => {
                        const response = await login(values);
                        if (response.data?.login.errors) {
                            setErrors(toErrorMap(response.data.login.errors));
                        } else if (response.data?.login.user) {
                            if (typeof router.query.next === 'string') {
                                router.push(router.query.next);
                            } else {
                                router.push('/');
                            }
                        }
                    }}
                >
                    {({ values, isSubmitting }) => (
                        <Form>
                            <InputField
                                name='usernameOrEmail'
                                placeholder='Username Or Email'
                                label='Username Or Email'
                            />
                            <InputField
                                name='password'
                                placeholder='Password'
                                label='Password'
                                type='password'
                                mt={4}
                            />
                            <Flex justifyContent='space-between' alignItems='center'>
                                <Button
                                    mt={4}
                                    isLoading={isSubmitting}
                                    type='submit'
                                    colorScheme='telegram'
                                >
                                    Login
                                </Button>
                                <Box mt={4}>
                                    <NextLink href='/forgot-password'>
                                        <Link ml='auto'>Forgot Password?</Link>
                                    </NextLink>
                                </Box>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        </>
    );
};

export default withUrqlClient(createUrqlClient)(Login);
