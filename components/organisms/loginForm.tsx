'use client';

import {
  Anchor,
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  id: number;
  username: string;
  email: string | null;
  roles: string[];
  token: string;
  type: string;
}

export function AuthenticationForm(props: PaperProps) {
  const router = useRouter();
  const [type, toggle] = useToggle(['login', 'register']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const form = useForm({
    initialValues: {
      email: '',
      username: '',
      password: '',
      role: 'patient', // Default role
    },
    validate: {
      email: (val) => (type === 'register' && !/^\S+@\S+$/.test(val) ? 'Nieprawidłowy email' : null),
      password: (val) => (val.length < 8 ? 'Hasło powinno mieć minimum 8 znaków' : null),
      username: (val) => (!val ? 'Nazwa użytkownika jest wymagana' : null),
    },
  });

  const handleSubmit = async (values: {
    username: string;
    password: string;
    email: string;
    role?: string;
  }) => {
    setLoading(true);
    setError('');
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const endpoint = type === 'register' ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          type === 'register'
            ? {
                username: values.username,
                email: values.email,
                password: values.password,
                roles: [values.role || 'patient']
              }
            : {
                username: values.username,
                password: values.password
              }
        )
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${type === 'register' ? 'Rejestracja' : 'Logowanie'} nieudane`);
      }
      
      if (type === 'register') {
        toggle(); // Switch to login after successful registration
        form.setFieldValue('password', '');
        setError('Rejestracja udana. Możesz się teraz zalogować.');
        return;
      }

      const data: AuthResponse = await response.json();
      
      // Store all auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('tokenType', data.type);
      localStorage.setItem('patientId', data.id.toString()); // Add this line to store patientId
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles
      }));

      router.push('/poczekalnia');
      
    } catch (err) { 
      console.error(`${type === 'register' ? 'Registration' : 'Login'} error:`, err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{height: 'calc(70vh)'}}>
      <Paper radius="md" p="xl" withBorder {...props}>
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
              <TextInput
                required
                label="Email"
                placeholder="twoj@email.com"
                value={form.values.email}
                onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                error={form.errors.email}
                radius="md"
              />
            )}

            <PasswordInput
              required
              label="Hasło"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
              radius="md"
            />

            {type === 'register' && (
              <Select
                label="Typ konta"
                data={[
                  { value: 'patient', label: 'Pacjent' },
                  { value: 'doctor', label: 'Lekarz' }
                ]}
                value={form.values.role}
                onChange={(value) => form.setFieldValue('role', value || 'patient')}
              />
            )}
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
