"use client";

import { disconnectUserFromPlan } from "@/lib/actions";
import { Button } from "../ui/button";

const DisconnectPlan = ({
  user,
  style,
}: {
  user: { email: string };
  style?: string;
}) => {
  return (
    <Button
      className={`w-full ${style}`}
      /* onClick={async () => {
        if (user.email) {
          const res = await disconnectUserFromPlan(user.email);
          console.log("res: ", res);
        }
      }} */
    >
      Disconnect
    </Button>
  );
};
export default DisconnectPlan;
