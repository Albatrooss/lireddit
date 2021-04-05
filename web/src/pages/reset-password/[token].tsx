import React, { FunctionComponent, useState } from 'react';
import { Button, FormControl, FormErrorMessage, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useResetPasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { withUrqlClient, WithUrqlProps } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link';
import MyHead from '../../components/MyHead';

const ResetPassword = () => {
    const router = useRouter();
    const token = typeof router.query.token === 'string' ? router.query.token : '';
    const [, changePassword] = useResetPasswordMutation();
    const [tokenError, setTokenError] = useState('');

    return (
        <>
            <MyHead title='Reset Password' />
            <Wrapper variant='sm'>
                <Formik
                    initialValues={{ password: '', confirmPassword: '' }}
                    onSubmit={async (values, { setErrors }) => {
                        if (values.password !== values.confirmPassword)
                            return setErrors({
                                confirmPassword: 'Passwords do not match',
                            });
                        const response = await changePassword({
                            token,
                            newPassword: values.password,
                        });
                        if (response.data?.resetPassword.errors) {
                            const errorMap = toErrorMap(response.data.resetPassword.errors);
                            if ('token' in errorMap) {
                                setTokenError(errorMap.token);
                            }
                            setErrors(errorMap);
                        } else if (response.data?.resetPassword.user) {
                            router.push('/');
                        }
                    }}
                >
                    {({ _, isSubmitting }) => (
                        <Form>
                            <InputField
                                name='password'
                                placeholder='Password'
                                label='Password'
                                type='password'
                            />
                            <InputField
                                name='confirmPassword'
                                placeholder='Confirm Password'
                                label='Confirm Password'
                                type='password'
                                mt={4}
                            />
                            <FormControl
                                isInvalid={!!tokenError}
                                display='flex'
                                alignItems='flex-end'
                            >
                                <FormErrorMessage>{tokenError}</FormErrorMessage>
                                {tokenError && (
                                    <NextLink href='/forgot-password'>
                                        <Link ml='auto'>Resend email</Link>
                                    </NextLink>
                                )}
                            </FormControl>
                            <Button
                                mt={4}
                                isLoading={isSubmitting}
                                type='submit'
                                colorScheme='telegram'
                            >
                                Reset Password
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        </>
    );
};

export default withUrqlClient(createUrqlClient)(ResetPassword);
