'use client'
import {
    IconBook,
    IconChartPie3,
    IconChevronDown,
    IconCode,
    IconCoin,
    IconFingerprint,
    IconNotification,
  } from '@tabler/icons-react';
  import {
    Anchor,
    Box,
    Burger,
    Button,
    Center,
    Collapse,
    Divider,
    Drawer,
    Group,
    HoverCard,
    ScrollArea,
    SimpleGrid,
    Text,
    ThemeIcon,
    UnstyledButton,
    useMantineTheme,
  } from '@mantine/core';
  import { useDisclosure } from '@mantine/hooks';
  import { IconVaccine } from '@tabler/icons-react';
  import classes from '../../styles/HeaderMegaMenu.module.css';
  import { useAuth } from '@/hooks/useAuth';
  
  const mockdata = [
    {
      icon: IconCode,
      title: 'Open source',
      description: 'This Pokémon’s cry is very loud and distracting',
    },
    {
      icon: IconCoin,
      title: 'Free for everyone',
      description: 'The fluid of Smeargle’s tail secretions changes',
    },
    {
      icon: IconBook,
      title: 'Documentation',
      description: 'Yanma is capable of seeing 360 degrees without',
    },
    {
      icon: IconFingerprint,
      title: 'Security',
      description: 'The shell’s rounded shape and the grooves on its.',
    },
    {
      icon: IconChartPie3,
      title: 'Analytics',
      description: 'This Pokémon uses its flying ability to quickly chase',
    },
    {
      icon: IconNotification,
      title: 'Notifications',
      description: 'Combusken battles with the intensely hot flames it spews',
    },
  ];
  
  export function HeaderMegaMenu() {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
    const { isAuthenticated, logout } = useAuth();
    const theme = useMantineTheme();
  
    const links = mockdata.map((item) => (
      <UnstyledButton className={classes.subLink} key={item.title}>
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon size={34} variant="default" radius="md">
            <item.icon size={22} color={theme.colors.blue[6]} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500}>
              {item.title}
            </Text>
            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    ));
  
    return (
      <Box pb={120}>
        <header className={classes.header}>
          <Group justify="space-between" h="100%">
            <Anchor href='/'>
                <IconVaccine size={30} />
            </Anchor>
  
            <Group h="100%" gap={0} visibleFrom="sm">
              <a href="/" className={classes.link}>
                Start
              </a>
              <a href="https://github.com/Oschly/poczekalnia-server" target='_blank' className={classes.link}>
                GitHub - Server
              </a>
              <a href="https://github.com/michalspoko18/poczekalnia-app" target='_blank' className={classes.link}>
                GitHub - App
              </a>
              <a href="#" className={classes.link}>

              </a>
            </Group>
  
            <Group visibleFrom="sm">
              {isAuthenticated ? (
                <>
                  <Anchor href='/poczekalnia'>
                    <Button variant="default">Poczekalnia</Button>
                  </Anchor>
                  <Button variant="filled" color="red" onClick={logout}>
                    Wyloguj
                  </Button>
                </>
              ) : (
                <Anchor href='/login'>
                  <Button variant="default">Zaloguj</Button>
                </Anchor>
              )}
            </Group>
  
            <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
          </Group>
        </header>
  
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          title="Navigation"
          hiddenFrom="sm"
          zIndex={1000000}
        >
          <ScrollArea h="calc(100vh - 80px" mx="-md">
            <Divider my="sm" />
  
            <a href="/" className={classes.link}>
              Start
            </a>
            <a href="https://github.com/Oschly/poczekalnia-server" className={classes.link}>
              GitHub - Server
            </a>
            <a href="https://github.com/michalspoko18/poczekalnia-app" className={classes.link}>
              GitHub - App
            </a>
  
            <Divider my="sm" />
  
            <Group justify="center" grow pb="xl" px="md">
              {isAuthenticated ? (
                <>
                  <Anchor href='/poczekalnia'>
                    <Button variant="default">Poczekalnia</Button>
                  </Anchor>
                  <Button variant="filled" color="red" onClick={logout}>
                    Wyloguj
                  </Button>
                </>
              ) : (
                <Anchor href='/login'>
                  <Button variant="default">Zaloguj</Button>
                </Anchor>
              )}
            </Group>
          </ScrollArea>
        </Drawer>
      </Box>
    );
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patientId');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('tokenType');
    window.location.href = '/login'; 
  };