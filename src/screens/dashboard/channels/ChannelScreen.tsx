// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Plus, Search, Eye, Trash2, MoreHorizontal, Power, PowerOff } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { trpc } from "@/lib/trpc";
// import { toast } from "sonner";

// export default function ChannelsScreenOld() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
//   const router = useRouter();

//   const { data: channels = [], isLoading } = trpc.channel.getAll.useQuery();
//   const utils = trpc.useUtils();

//   const deleteMutation = trpc.channel.delete.useMutation({
//     onSuccess: () => {
//       toast.success("Channel deleted successfully");
//       utils.channel.getAll.invalidate();
//       setDeleteDialogOpen(false);
//       setChannelToDelete(null);
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to delete channel");
//     },
//   });

//   const updateMutation = trpc.channel.update.useMutation({
//     onSuccess: () => {
//       toast.success("Channel updated successfully");
//       utils.channel.getAll.invalidate();
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to update channel");
//     },
//   });

//   const filteredChannels = channels.filter(channel =>
//     channel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     channel.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleCreateChannel = () => {
//     router.push("/dashboard/forms/create");
//   };

//   const handleEditChannel = (id: string) => {
//     router.push(`/dashboard/forms/create?id=${id}`);
//   };

//   const handleCardClick = (id: string) => {
//     handleEditChannel(id);
//   };

//   const handleDeleteChannel = (id: string) => {
//     setChannelToDelete(id);
//     setDeleteDialogOpen(true);
//   };

//   const confirmDelete = () => {
//     if (channelToDelete) {
//       deleteMutation.mutate({ id: channelToDelete });
//     }
//   };

//   const handleToggleStatus = (id: string, currentStatus: boolean) => {
//     updateMutation.mutate({
//       id,
//       data: { is_active: !currentStatus }
//     });
//   };

//   return (
//     <div className="flex-1 space-y-4 p-8 pt-6">
//       <div className="flex items-center justify-between space-y-2">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Channels</h2>
//           <p className="text-muted-foreground">
//             Manage your reporting channels and forms
//           </p>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Button onClick={handleCreateChannel}>
//             <Plus className="mr-2 h-4 w-4" />
//             Create Channel
//           </Button>
//         </div>
//       </div>

//       <div className="flex items-center space-x-2">
//         <div className="relative flex-1 md:max-w-sm">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search channels..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-8"
//           />
//         </div>
//       </div>

//       {isLoading && (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">Loading channels...</p>
//         </div>
//       )}

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {filteredChannels.map((channel) => (
//           <Card
//             key={String(channel._id)}
//             className="hover:shadow-md transition-shadow cursor-pointer"
//             onClick={() => handleCardClick(String(channel._id))}
//           >
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <div className="space-y-1">
//                 <CardTitle className="text-base font-medium flex items-center gap-2">
//                   <div
//                     className="w-3 h-3 rounded-full"
//                     style={{ backgroundColor: channel.primary_color }}
//                   />
//                   {channel.title}
//                 </CardTitle>
//                 <Badge variant={channel.is_active ? "default" : "secondary"}>
//                   {channel.is_active ? "Published" : "Draft"}
//                 </Badge>
//               </div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//                   <Button variant="ghost" className="h-8 w-8 p-0">
//                     <MoreHorizontal className="h-4 w-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem onClick={(e) => {
//                     e.stopPropagation();
//                     handleEditChannel(String(channel._id));
//                   }}>
//                     <Eye className="mr-2 h-4 w-4" />
//                     View & Edit
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={(e) => {
//                     e.stopPropagation();
//                     handleToggleStatus(String(channel._id), channel.is_active);
//                   }}>
//                     {channel.is_active ? (
//                       <>
//                         <PowerOff className="mr-2 h-4 w-4" />
//                         Make Draft
//                       </>
//                     ) : (
//                       <>
//                         <Power className="mr-2 h-4 w-4" />
//                         Publish
//                       </>
//                     )}
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     className="text-destructive"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDeleteChannel(String(channel._id));
//                     }}
//                   >
//                     <Trash2 className="mr-2 h-4 w-4" />
//                     Delete
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </CardHeader>
//             <CardContent>
//               <CardDescription className="text-sm mb-4">
//                 {channel.description}
//               </CardDescription>
//               <div className="flex items-center justify-between text-sm text-muted-foreground">
//                 <span>0 cases</span>
//                 <span>/{channel.slug}</span>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {filteredChannels.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">No channels found matching your search.</p>
//         </div>
//       )}

//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the channel
//               and remove all associated data from our servers.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

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
