import React from 'react';
import { WrapperVariant } from '../interfaces';
import Navbar from './Navbar';
import { Wrapper } from './Wrapper';

interface Props {
    variant?: WrapperVariant;
}

const Layout: React.FC<Props> = ({ variant, children }) => {
    return (
        <>
            <Navbar pageProps />
            <Wrapper variant={variant}>{children}</Wrapper>
        </>
    );
};

export default Layout;
