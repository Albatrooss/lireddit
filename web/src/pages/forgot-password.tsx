import React, { useState } from 'react'
import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { useRouter } from 'next/router'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import MyHead from '../components/MyHead'

const ForgotPassword = ({}) => {
    const router = useRouter()
    const [, forgotPassword] = useForgotPasswordMutation()
    const [complete, setComplete] = useState(false)

    return (
        <>
            <MyHead title='Forgot Password' />
            <Wrapper variant='sm'>
                {complete ? (
                    <Box w='100%'>
                        <Heading size='lg'>Email Sent</Heading>
                        <Text mt={4}>Check your email for the reset link</Text>
                    </Box>
                ) : (
                    <Formik
                        initialValues={{ email: '' }}
                        onSubmit={async (values, { setErrors }) => {
                            await forgotPassword({
                                email: values.email,
                            })
                            setComplete(true)
                        }}
                    >
                        {({ _, isSubmitting }) => (
                            <Form>
                                <InputField
                                    name='email'
                                    placeholder='example@example.ca'
                                    label='Email'
                                    type='email'
                                    required
                                />
                                <Button
                                    mt={4}
                                    isLoading={isSubmitting}
                                    type='submit'
                                    colorScheme='telegram'
                                >
                                    Send Reset Email
                                </Button>
                            </Form>
                        )}
                    </Formik>
                )}
            </Wrapper>
        </>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)
