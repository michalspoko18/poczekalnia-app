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
    
    try {
      const endpoint = type === 'login' ? 'auth/login' : 'users/add';
      const response = await fetch(`https://dummyjson.com/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          type === 'login'
            ? {
                username: values.username,
                password: values.password,
                expiresInMins: 30,
              }
            : {
                username: values.username,
                password: values.password,
                email: values.email,
                firstName: values.name,
              }
        ),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `${upperFirst(type)} failed`);
      }
      
      console.log(`${upperFirst(type)} successful:`, data);
      
      if (type === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        router.push('/poczekalnia');
      } else {
        toggle();
        setError('Registration successful. Please log in.');
      }
    } catch (err) { 
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center>
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
