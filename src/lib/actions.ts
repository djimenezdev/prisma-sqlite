"use server";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { authOptions } from "./nextAuth";
import { revalidatePath } from "next/cache";
import { stripe } from "./stripe";
import { redirect } from "next/navigation";
import { getUserWithPlan } from "./getData";

export async function createPlanCheckoutSession(priceId: string) {
  let sessionUrl: string | null = null;
  try {
    const userSession = await getServerSession(authOptions);

    if (!userSession?.user) {
      throw new Error("User not authenticated");
    }

    const email = userSession.user.email;

    if (!email) {
      throw new Error("User email not found");
    }
    console.log("priceId: ", priceId);
    console.log("email: ", email);

    const userDetails = await getUserWithPlan(email);

    let customer = {};
    if (!userDetails?.stripeId) {
      customer = {
        customer: userDetails?.stripeId,
      };
    } else {
      customer = {
        customer_email: email,
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/`,
      ...customer,
    });

    if (!session.url) {
      throw new Error("Checkout session URL not found");
    }

    console.log("session: ", session.url);

    sessionUrl = session.url;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create checkout session" };
  }

  if (sessionUrl) {
    redirect(sessionUrl);
  }
}

// testing actions below here
export async function updateUserPlan(email: string, priceId: string) {
  try {
    const userSession = await getServerSession(authOptions);

    if (!userSession?.user) {
      throw new Error("User not authenticated");
    }

    // Update user with the plan's priceId
    await prisma.user.update({
      where: { email: userSession.user?.email ?? email },
      data: { planId: priceId },
    });
    revalidatePath("/plans");
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user plan");
  }
}

export async function disconnectUserFromPlan(email: string) {
  try {
    const userSession = await getServerSession(authOptions);

    if (!userSession?.user) {
      throw new Error("User not authenticated");
    }
    await prisma.user.update({
      where: { email },
      data: { planId: null },
    });
    revalidatePath("/plans");

    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to disconnect user from plan");
  }
}
