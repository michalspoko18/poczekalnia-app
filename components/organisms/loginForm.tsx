'use client';

import {
  Anchor,
  Button,
  Center,
  Divider,
  Group,
  Notification,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle } from '@mantine/hooks';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; 

export function AuthenticationForm(props: PaperProps) {
  const router = useRouter();
  const { user } = useAuth(); 
  const [type, toggle] = useToggle(['login', 'register']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      username: '',
      password: '',
      phone: '',
      role: 'patient',
      name: '',
      surname: '',
      pesel: '',
      jobIdNumber: '',
    },
    validate: {
      email: (val) => (type === 'register' && !/^\S+@\S+$/.test(val) ? 'Nieprawidłowy email' : null),
      password: (val) => (val.length < 8 ? 'Hasło powinno mieć minimum 8 znaków' : null),
      username: (val) => (!val ? 'Nazwa użytkownika jest wymagana' : null),
      phone: (val) =>
        type === 'register' && !/^\d{9,15}$/.test(val) ? 'Numer telefonu powinien mieć od 9 do 15 cyfr' : null,
    },
  });

  const handleSmsToggle = async () => {
    console.log('Patient data:', user?.patient);
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

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError('');
    setShowNotification(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    let endpoint = '';
    let body: any = {};

    if (type === 'register') {
      if (values.role === 'doctor') {
        endpoint = '/api/auth/register/doctor';
        body = {
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          roles: ['doctor'],
          name: values.name,
          surname: values.surname,
          jobIdNumber: values.jobIdNumber,
        };
      } else {
        endpoint = '/api/auth/register/patient';
        body = {
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          roles: ['patient'],
          name: values.name,
          surname: values.surname,
          pesel: values.pesel,
        };
      }
    } else {
      endpoint = '/api/auth/login';
      body = {
        username: values.username,
        password: values.password,
      };
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message;
        } catch (e) {
          errorMessage = response.statusText;
        }
        throw new Error(errorMessage || `${type === 'register' ? 'Rejestracja' : 'Logowanie'} nieudane`);
      }

      if (type === 'register') {
        const data = await response.json();
        setShowNotification(data.message || 'Rejestracja zakończona sukcesem!');
        toggle();
        form.reset();
        return;
      }

      let data;
      try {
        if (endpoint === '/api/auth/login') {
          const token = await response.text();
          data = { token };
        } else {
          data = await response.json();
        }
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Nieprawidłowa odpowiedź z serwera');
      }

      if (type === 'register') {
        toggle();
        form.reset();
        setError('Rejestracja zakończona sukcesem. Możesz się teraz zalogować.');
        return;
      }

      if (!data.token) {
        throw new Error('Nieprawidłowe dane logowania');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('tokenType', 'Bearer'); 

      const meResponse = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Accept': 'application/json',
        },
      });
      if (!meResponse.ok) {
        throw new Error('Nie udało się pobrać danych użytkownika');
      }
      const meData = await meResponse.json();

      localStorage.setItem('user', JSON.stringify({
        id: meData.id,
        username: meData.username,
        email: meData.email,
        roles: meData.roles,
        patientId: meData.patientId,
        doctorId: meData.doctorId,
        name: meData.name,
        surname: meData.surname,
      }));

      if (meData.patientId) {
        localStorage.setItem('patientId', meData.patientId.toString());
      }
      if (meData.doctorId) {
        localStorage.setItem('doctorId', meData.doctorId.toString());
      }

      router.push('/poczekalnia');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas przesyłania formularza');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ marginTop: '150px', height: 'calc(70vh)' }}>
      <Paper radius="md" p="xl" withBorder {...props}>
        {showNotification && (
          <div
            style={{
              position: 'fixed',
              right: 24,
              bottom: 24,
              zIndex: 6000,
              maxWidth: 360,
            }}
          >
            <Notification
              radius="xl"
              title="Rejestracja"
              onClose={() => setShowNotification(null)}
              withCloseButton
              color="green"
            >
              {showNotification}
            </Notification>
          </div>
        )}

        <Text size="lg" fw={500}>
          {type === 'register' ? 'Utwórz nowe konto' : 'Zaloguj się do panelu!'}
        </Text>
        <Divider label={type === 'register' ? 'Zarejestruj się' : 'Zaloguj się'} labelPosition="center" my="lg" />

        {error && (
          <Text color={error.includes('udana') ? 'green' : 'red'} size="sm" mb="md">
            {error}
          </Text>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="Login"
              value={form.values.username}
              onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
              error={form.errors.username}
              radius="md"
            />

            {type === 'register' && (
              <>
                <TextInput
                  required
                  label="Email"
                  placeholder="twoj@email.com"
                  value={form.values.email}
                  onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                  error={form.errors.email}
                  radius="md"
                />
                <TextInput
                  required
                  label="Numer telefonu"
                  placeholder="48123456789"
                  value={form.values.phone}
                  onChange={(event) => form.setFieldValue('phone', event.currentTarget.value)}
                  error={form.errors.phone}
                  radius="md"
                />
                <TextInput
                  required
                  label="Imię"
                  value={form.values.name}
                  onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                  radius="md"
                />
                <TextInput
                  required
                  label="Nazwisko"
                  value={form.values.surname}
                  onChange={(event) => form.setFieldValue('surname', event.currentTarget.value)}
                  radius="md"
                />
                <Select
                  label="Typ konta"
                  data={[
                    { value: 'patient', label: 'Pacjent' },
                    { value: 'doctor', label: 'Lekarz' },
                  ]}
                  value={form.values.role}
                  onChange={(value) => form.setFieldValue('role', value || 'patient')}
                />
                {form.values.role === 'patient' && (
                  <TextInput
                    required
                    label="PESEL"
                    value={form.values.pesel}
                    onChange={(event) => form.setFieldValue('pesel', event.currentTarget.value)}
                    radius="md"
                  />
                )}
                {form.values.role === 'doctor' && (
                  <TextInput
                    required
                    label="Numer PWZ"
                    value={form.values.jobIdNumber}
                    onChange={(event) => form.setFieldValue('jobIdNumber', event.currentTarget.value)}
                    radius="md"
                  />
                )}
              </>
            )}

            <PasswordInput
              required
              label="Hasło"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
              radius="md"
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
              {type === 'register'
                ? 'Masz już konto? Zaloguj się'
                : 'Nie masz konta? Zarejestruj się'}
            </Anchor>
            <Button type="submit" radius="xl" loading={loading}>
              {type === 'register' ? 'Zarejestruj' : 'Zaloguj'}
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
}
