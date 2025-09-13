"use server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getChannels } from "@/lib/actions/channels";
import ChannelCardActions from "./ChannelCardActions";

export default async function ChannelCards() {
  const channels = await getChannels();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: channel.primary_color }}
                  />
                  {channel.title}
                </CardTitle>
                <Badge variant={channel.is_active ? "default" : "secondary"}>
                  {channel.is_active ? "Published" : "Draft"}
                </Badge>
              </div>
              <ChannelCardActions channelId={channel._id} isActive={channel.is_active} />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4">{channel.description}</CardDescription>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{channel.access_code}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No channels found.</p>
        </div>
      )}
    </>
  );
}
