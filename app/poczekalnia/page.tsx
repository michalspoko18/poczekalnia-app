'use client';
import { ColorSchemeToggle } from '@/components/templates/ColorSchemeToggle/ColorSchemeToggle'; 
import { Welcome } from '@/components/templates/Welcome/Welcome';
import { Anchor, Text, Title, Loader, Center, Button, Group } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { FooterCentered } from '@/components/organisms/FooterCentered';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Center>
        <Button onClick={logout} color="red">
          Wyloguj
        </Button>
      </Center>
    </>
  );
}


