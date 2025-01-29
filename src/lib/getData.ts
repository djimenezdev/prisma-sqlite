import "server-only";
import { prisma } from "./prisma";

export async function getPlans() {
  const plans = await prisma.plan.findMany();
  return plans;
}

export async function getUserWithPlan(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      plan: true,
    },
  });
  return user;
}
