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
    if (user?.roles.includes('ROLE_ADMIN')) {
      return (
        <Stack align="center">
          <Title order={2}>Panel Administratora</Title>
          <Group>
            <Button color="blue">Zarządzaj Użytkownikami</Button>
            <Button color="green">Zarządzaj Placówkami</Button>
            <Button color="yellow">Raporty Systemowe</Button>
          </Group>
        </Stack>
      );
    }

    if (user?.roles.includes('ROLE_DOCTOR')) {
      return (
        <Stack align="center">
          <Title order={2}>Panel Lekarza</Title>
          <Group>
            <Button color="blue">Mój Kalendarz</Button>
            <Button color="green">Lista Pacjentów</Button>
            <Button color="yellow">Historia Wizyt</Button>
          </Group>
        </Stack>
      );
    }

    // Default case - assume ROLE_PATIENT or basic user
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
          <Button color="grey">Historia Leczenia</Button>
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


