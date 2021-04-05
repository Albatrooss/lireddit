import React from 'react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Button } from '@chakra-ui/button';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import MyHead from '../components/MyHead';
import { Heading } from '@chakra-ui/layout';

const Register: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();

    return (
        <>
            <MyHead title='Register' />
            <Wrapper variant='sm'>
                <Heading mb={4} textAlign='center' color='telegram.900'>
                    Register
                </Heading>
                <Formik
                    initialValues={{ username: '', email: '', password: '' }}
                    onSubmit={async (values, { setErrors }) => {
                        const response = await register({ options: values });
                        if (response.data?.register.errors) {
                            setErrors(toErrorMap(response.data.register.errors));
                        } else if (response.data?.register.user) {
                            router.push('/');
                        }
                    }}
                >
                    {({ values, isSubmitting }) => (
                        <Form>
                            <InputField name='username' placeholder='Username' label='Username' />
                            <InputField name='email' placeholder='Email' label='Email' mt={4} />
                            <InputField
                                name='password'
                                placeholder='Password'
                                label='Password'
                                type='password'
                                mt={4}
                            />
                            <Button
                                mt={4}
                                isLoading={isSubmitting}
                                type='submit'
                                colorScheme='telegram'
                            >
                                Register
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        </>
    );
};

export default withUrqlClient(createUrqlClient)(Register);
