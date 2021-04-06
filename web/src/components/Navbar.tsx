import React from 'react';
import { Box, Center, Flex, Heading, Link, Text } from '@chakra-ui/layout';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

const Navbar: React.FC = () => {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({
        pause: isServer(),
    });

    let body = null;

    if (fetching) {
        body = null;
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href='/login'>
                    <Link color='white' mr={4}>
                        Login
                    </Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link color='white'>Register</Link>
                </NextLink>
            </>
        );
    } else {
        body = (
            <>
                <Text color='white' textTransform='capitalize' mr={4}>
                    {data.me.username}
                </Text>
                <Button
                    colorScheme='orange'
                    onClick={async () => await logout()}
                    isLoading={logoutFetching}
                >
                    Logout
                </Button>
            </>
        );
    }

    return (
        <Box bg='Background' position='sticky' top={0} shadow='md' zIndex={1}>
            <Flex maxW='1366px' justifyContent='center' alignItems='center' m='0 auto' p='8px 0'>
                <NextLink href='/'>
                    <Box cursor='pointer' borderRight='2px solid white' p='0 16px' h='100%'>
                        <Heading size='sm' color='orange' textAlign='center'>
                            OHOHOHOH
                        </Heading>
                        <Heading size='md' color='white' textAlign='center'>
                            OHOHOH
                        </Heading>
                    </Box>
                </NextLink>
                <NextLink href='/create-post'>
                    <Link ml={4} color='white' fontWeight='extrabold'>
                        CREATE
                    </Link>
                </NextLink>
                <Box
                    ml='auto'
                    css={{ textTransform: 'capitalize' }}
                    color='white'
                    display='flex'
                    alignItems='center'
                >
                    {body}
                </Box>
            </Flex>
        </Box>
    );
};

export default withUrqlClient(createUrqlClient)(Navbar);
