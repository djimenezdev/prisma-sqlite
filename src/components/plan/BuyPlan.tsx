"use client";

import { Button } from "@/components/ui/button";
import { createPlanCheckoutSession } from "@/lib/actions";
// import { updateUserPlan } from "@/lib/actions";

const BuyPlan = ({
  planData,
  user,
  style,
}: {
  planData: {
    id: string;
    name: string;
  };
  user: {
    email: string | undefined;
  };
  style?: string;
}) => {
  return (
    <Button
      className={`w-full ${style}`}
      onClick={async () => {
        if (user?.email) {
          await createPlanCheckoutSession(planData.id);
        }
      }}
    >
      Choose {planData.name}
    </Button>
  );
};
export default BuyPlan;
