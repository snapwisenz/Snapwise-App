import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface SnapwiseInviteEmailProps {
  inviteUrl: string;
  role: string;
  isPhotographer: boolean;
}

export const SnapwiseInviteEmail = ({
  inviteUrl,
  role,
  isPhotographer,
}: SnapwiseInviteEmailProps) => {
  const previewText = `You have been invited to join the Snapwise team!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Welcome to Snapwise</Text>
          </Section>
          <Text style={text}>Hello!</Text>
          <Text style={text}>
            You have been invited to join the Snapwise team as a {role}.
          </Text>
          {isPhotographer && (
            <Text style={text}>
              Please click the link below to set up your account, enter your home base for routing, and connect your calendar.
            </Text>
          )}
          {!isPhotographer && (
            <Text style={text}>
              Please click the link below to set up your account.
            </Text>
          )}
          <Section style={btnContainer}>
            <Button style={button} href={inviteUrl}>
              Accept Invitation & Setup Profile
            </Button>
          </Section>
          <Text style={footer}>
            If you were not expecting this invitation, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SnapwiseInviteEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const header = {
  padding: '24px 0',
};

const headerText = {
  fontSize: '24px',
  lineHeight: '32px',
  fontWeight: 'bold',
  color: '#333',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  fontWeight: 'bold',
};

const footer = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#8898aa',
};
