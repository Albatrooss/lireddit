import Head from 'next/head';
import React from 'react';

interface Props {
    title?: string;
}

const MyHead: React.FC<Props> = ({ title, children }) => {
    return (
        <Head>
            <title>OHOHOH{title ? ` | ${title}` : ''}</title>
            {children}
        </Head>
    );
};

export default MyHead;
