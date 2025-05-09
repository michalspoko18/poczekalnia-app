'use client';

import { useEffect, useState } from 'react';
import { Center, Stack, Text, Switch, Group, Loader } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';

export default function UserPanel() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych użytkownika');
        }

        const data = await response.json();
        console.log('Response from /api/auth/me:', data); // Logowanie danych
        setSmsNotificationsEnabled(data.patient?.smsNotificationsEnabled || false);
        setUserId(data.id);
        localStorage.setItem('userId', data.id.toString());
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania danych użytkownika');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('User data in useAuth:', user);
  }, [user]);

  const handleSmsToggle = async () => {
    console.log('Patient ID:', user?.patient?.id); 
    if (!user?.patient?.id) {
      setError('Brak ID pacjenta. Nie można zmienić ustawień powiadomień SMS.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${user.patient.id}/notifications`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ smsNotificationsEnabled: !smsNotificationsEnabled }),
        }
      );

      if (!response.ok) {
        throw new Error('Nie udało się zmienić ustawień powiadomień SMS');
      }

      setSmsNotificationsEnabled((prev) => !prev);
    } catch (err) {
      setError('Wystąpił błąd podczas zmiany ustawień powiadomień SMS');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={400}>
        <Text color="red">{error}</Text>
      </Center>
    );
  }

  return (
    <Center>
      <Stack align="center">
        <Text size="xl" fw={700}>
          Profil użytkownika
        </Text>
        <Text>
          <strong>Imię i nazwisko:</strong> {user?.name} {user?.surname}
        </Text>
        <Text>
          <strong>Email:</strong> {user?.email}
        </Text>
        <Text>
          <strong>Telefon:</strong> {user?.phone}
        </Text>
        <Text>
          <strong>ID użytkownika:</strong> {userId}
        </Text>
        {user?.roles.includes('ROLE_PATIENT') && (
          <>
            <Text>
              <strong>PESEL:</strong> {user?.patient?.pesel}
            </Text>
            <Group>
              <Text>Powiadomienia SMS:</Text>
              <Switch
                checked={smsNotificationsEnabled}
                onChange={handleSmsToggle}
                disabled={loading}
              />
            </Group>
          </>
        )}
        {user?.roles.includes('ROLE_DOCTOR') && (
          <Text>
            <strong>Rola:</strong> Lekarz
          </Text>
        )}
      </Stack>
    </Center>
  );
}