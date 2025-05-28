'use client';
import { ColorSchemeToggle } from '@/components/templates/ColorSchemeToggle/ColorSchemeToggle'; 
import { Welcome } from '@/components/templates/Welcome/Welcome';
import { Anchor, Text, Title, Loader, Center, Button, Group, Stack } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { FooterCentered } from '@/components/organisms/FooterCentered';

export default function Home() {
  const { isAuthenticated, logout, user } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  const renderRoleBasedContent = () => {
    if (user?.roles.includes('ROLE_DOCTOR')) {
      return (
        <Stack align="center">
          <Title order={2}>Panel Lekarza</Title>
          <Group>
          <Anchor href="/moje-wizyty">
            <Button color="green">Moje Wizyty</Button>
          </Anchor>
          <Anchor href='/profil'>
            <Button color="grey">Profil</Button>
          </Anchor>
          </Group>
        </Stack>
      );
    }
    
    return (
      <Stack align="center">
        <Title order={2}>Panel Pacjenta</Title>
        <Group>
          <Anchor href="/umow-wizyte">
            <Button color="blue">Umów Wizytę</Button>
          </Anchor>
          <Anchor href="/moje-wizyty">
            <Button color="green">Moje Wizyty</Button>
          </Anchor>
          <Anchor href='/profil'>
            <Button color="grey">Profil</Button>
          </Anchor>
        </Group>
      </Stack>
    );
  };

  return (
    <>
      <Stack py="xl">
        {renderRoleBasedContent()}
        <Center>
          <Button onClick={logout} color="red">
            Wyloguj
          </Button>
        </Center>
      </Stack>
    </>
  );
}


