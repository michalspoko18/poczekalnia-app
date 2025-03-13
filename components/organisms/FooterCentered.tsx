'use client'
import { IconBrandGithub, IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import { ActionIcon, Anchor, Group } from '@mantine/core';
import classes from '../../styles/FooterCentered.module.css';

const links = [
  { link: '/', label: 'Start' },
  { link: '/poczekalnia', label: 'Poczekalnia' },
  { link: '#', label: 'O projekcie' },
];

export function FooterCentered() {
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      href={link.link}
      lh={1}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>

        <Group className={classes.links}>{items}</Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <Anchor href='https://github.com/Oschly/poczekalnia-server' target='_blank'>
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandGithub size={18} stroke={1.5} />
            </ActionIcon>
          </Anchor>
          <Anchor href='https://github.com/michalspoko18/poczekalnia-app' target='_blank'>
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandGithub size={18} stroke={1.5} />
            </ActionIcon>
          </Anchor>
        </Group>
      </div>
    </div>
  );
}