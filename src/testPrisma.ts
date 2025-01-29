import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Starting main");
  // First create the plan
  const plan = await prisma.plan.create({
    data: {
      type: "monthly",
      name: "Pro",
      currencyType: "usd",
      priceId: "price_1234567890",
      productId: "prod_1234567890",
      cost: "29",
      description: "Cool plan",
    },
  });

  // Then create the user with a connection to the existing plan
  const user = await prisma.user.create({
    data: {
      email: "test3@test.com",
      stripeId: "cus_1234567890",
      planId: plan.priceId, // Connect using the priceId
      subscriptionId: "sub_1234567890",
      subscriptionStatus: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: {
      plan: true,
    },
  });
  console.log(user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
