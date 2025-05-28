import { ModalsProvider } from '@mantine/modals';
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

const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 64;

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
      <body style={{ margin: 0, minHeight: '100vh', background: '#f9f9f9' }}>
        <MantineProvider
          theme={theme}
          withGlobalStyles
          withNormalizeCSS
          themeOverride={{
            components: {
              Modal: {
                defaultProps: {
                  zIndex: 5000,
                  centered: true,
                },
              },
            },
          }}
        >
          <ModalsProvider>
            <div style={{ minHeight: '100vh', position: 'relative', paddingTop: HEADER_HEIGHT, paddingBottom: FOOTER_HEIGHT }}>
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 3000,
                height: HEADER_HEIGHT,
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <HeaderMegaMenu />
              </div>
              <main style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)` }}>
                {children}
              </main>
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 3000,
                height: FOOTER_HEIGHT,
                background: '#fff',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
              }}>
                <FooterCentered />
              </div>
            </div>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
