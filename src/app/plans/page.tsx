import BuyPlan from "@/components/plan/BuyPlan";
// import DisconnectPlan from "@/components/plan/DisconnectPlan";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPlans, getUserWithPlan } from "@/lib/getData";
import { authOptions } from "@/lib/nextAuth";
import { getServerSession } from "next-auth";

// setup products and prices in stripe
// put together webhook for subscription
export default async function Plans() {
  const session = await getServerSession(authOptions);
  const plans = await getPlans();

  const user = session?.user?.email
    ? await getUserWithPlan(session.user.email)
    : null;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${
              user?.plan?.name === plan.name ? "bg-black text-white" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold mb-4">
                {plan.cost}
                <span className="text-sm font-normal">/month</span>
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {user?.plan !== null && (
                <BuyPlan
                  planData={{
                    id: plan.priceId,
                    name: plan.name,
                  }}
                  style={
                    user?.plan?.name === plan.name
                      ? "bg-white text-black hover:bg-blue-500/90"
                      : ""
                  }
                  user={{ email: user?.email }}
                />
              )}
              {/* {user?.plan?.name === plan.name && (
                <DisconnectPlan
                  user={{ email: user?.email }}
                  style={
                    user?.plan?.name === plan.name
                      ? "bg-white text-black hover:bg-blue-500/90"
                      : ""
                  }
                />
              )} */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
