import prisma from './src/config/db.js';

async function main() {
  const u = await prisma.user.findFirst({ where: { email: 'sandeep@campusiq.edu' } });
  console.log('USER_FETCHED:', u?.name, u?.email, u?.role);
  const c = await prisma.course.findFirst({ where: { courseCode: 'ISE402' } });
  console.log('COURSE_FETCHED:', c?.courseCode, c?.courseName);
  await prisma.$disconnect();
}

main().catch(console.error);
