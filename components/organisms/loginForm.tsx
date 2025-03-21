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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthenticationForm(props: PaperProps) {
  const router = useRouter();
  const [type, toggle] = useToggle(['login', 'register']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
      username: '',
    },

    // validate: {
    //   email: (val) => (type === 'register' && !/^\S+@\S+$/.test(val) ? 'Invalid email' : null),
    //   password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    //   username: (val) => (!val ? 'Username is required' : null),
    // },
  });

  const handleSubmit = async (values: {
    username: string;
    password: string;
    email?: string;
    name?: string;
    terms?: boolean;
  }) => {
    setLoading(true);
    setError('');
    
    const formData = new URLSearchParams();
    formData.append('username', values.username);
    formData.append('password', values.password);
    
    // Debug: Log request details
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log('API URL:', API_URL);
    console.log('Request payload:', formData.toString());
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Try connecting to Docker container
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'Access-Control-Allow-Origin': '*'
        },
        body: formData.toString(),
        signal: controller.signal,
        credentials: 'include',
        mode: 'cors' // Explicitly set CORS mode
      });
      
      clearTimeout(timeoutId);
      
      // Enhanced debugging
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Login failed: ${response.status} ${errorText}`);
      }
      
      if (response.status === 200) {
        console.log('Login successful');
        localStorage.setItem('token', 'temporary-token');
        localStorage.setItem('user', JSON.stringify({ username: values.username }));
        router.push('/poczekalnia');
      }
      
    } catch (err) { 
      console.error('Network error details:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timeout - server not responding');
        } else if (err.message.includes('Failed to fetch')) {
          setError(`Cannot connect to server at ${API_URL}. Make sure Docker container is running and ports are mapped correctly.`);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{height: 'calc(50vh)'}}>
      <Paper radius="md" p="xl" withBorder {...props}>
        <Text size="lg" fw={500}>
          Witaj, zaloguj się do panelu!
        </Text>

        <Divider label="Zaloguj używając email" labelPosition="center" my="lg" />

        {error && (
          <Text color="red" size="sm" mb="md">
            {error}
          </Text>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {/* {type === 'register' && (
              <TextInput
                required
                label="Name"
                placeholder="Your name"
                value={form.values.name}
                onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                radius="md"
              />
            )} */}

            <TextInput
              required
              label="Login/Email"
              value={form.values.username}
              onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
              error={form.errors.username}
              radius="md"
            />

            {/* {type === 'register' && (
              <TextInput
                required
                label="Email"
                placeholder="hello@example.com"
                value={form.values.email}
                onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                error={form.errors.email}
                radius="md"
              />
            )} */}

            <PasswordInput
              required
              label="Hasło"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
              radius="md"
            />

            {/* {type === 'register' && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
              />
            )} */}
          </Stack>

          <Group justify="space-between" mt="xl">
            {/* <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
              {type === 'register'
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </Anchor> */}
            <Button type="submit" radius="xl" loading={loading}>
              Zaloguj
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
}
