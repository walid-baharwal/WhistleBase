"use server";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import Link from "next/link";

import ChannelCards from "./ChannelCards";
import { Suspense } from "react";
import LottieLoading from "@/components/LottieLoading";

export default async function ChannelScreen() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Channels</h2>
          <p className="text-muted-foreground">Manage your reporting channels and forms</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/channels/form">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Channel
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<LottieLoading variant="secondary" message="Loading channels..." />}>
        <ChannelCards />
      </Suspense>
    </div>
  );
}
