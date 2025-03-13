import '@mantine/core/styles.css';
import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme';

import { HeaderMegaMenu } from '@/components/organisms/HeaderMegaMenu';

import { FooterCentered } from '@/components/organisms/FooterCentered';

export const metadata = {
  title: 'Poczekalnia - IPZ',
  description: 'Projekt realizowany w ramach zajęć IPZ',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <HeaderMegaMenu />
          <main style={{ paddingTop: '60px' }}>
            {children}
          </main>
          <FooterCentered />
        </MantineProvider>
      </body>
    </html>
  );
}
