import { Anchor, Text, Title } from '@mantine/core';
import classes from './Welcome.module.css';


export function Welcome() {

  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          Poczekalnia
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={880} mx="auto" mt="xl">
      Poczekalnia to aplikacja webowa usprawniająca proces rejestracji i zarządzania wizytami u lekarza. <br />System pozwala pacjentom na szybkie znalezienie dostępnych terminów, rezerwację wizyt, a także otrzymywanie powiadomień o zmianach i opóźnieniach. 
      </Text>
      <Text c="dimmed" ta="center" size="lg" maw={880} mx="auto" mt="xl">
      Aplikacja wspiera dynamiczne zarządzanie kolejką w przychodniach, umożliwia integrację z kalendarzami oraz przechowywanie historii wizyt i wyników badań.
      </Text>
    </>
  );
}
