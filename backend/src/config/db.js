import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv6first');
} catch (e) {}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
