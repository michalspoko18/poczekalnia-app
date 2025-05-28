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
  const [patientId, setPatientId] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);

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
        setUserData(data);
        setSmsNotificationsEnabled(data.patient?.smsNotificationsEnabled || false);
        setUserId(data.patient?.id || null);
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
    console.log('Patient ID:', userId); 

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${userId}/notifications`,
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
    <Center style={{ paddingTop: '50px' }}>
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
          <strong>Telefon:</strong> {userData?.phone}
        </Text>
        <Text>
          <strong>ID użytkownika:</strong> {user?.id}
        </Text>
        {user?.roles.includes('ROLE_PATIENT') && (
          <>
            <Text>
              <strong>PESEL:</strong> {userData?.patient?.pesel}
            </Text>
            <Group>
              <Text><strong>Powiadomienia SMS:</strong></Text>
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