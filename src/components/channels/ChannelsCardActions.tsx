"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, MoreHorizontal, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ChannelCardActionsProps {
  channelId: string;
  isActive: boolean;
}

export default function ChannelCardActions({ channelId, isActive }: ChannelCardActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const deleteMutation = trpc.channel.delete.useMutation({
    onSuccess: () => {
      toast.success("Channel deleted successfully");

      router.refresh();
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete channel");
    },
  });

  const updateMutation = trpc.channel.update.useMutation({
    onSuccess: () => {
      toast.success("Channel updated successfully");

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update channel");
    },
  });

  const handleEditChannel = () => {
    router.push(`/dashboard/forms/create?id=${channelId}`);
  };

  const handleDeleteChannel = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate({ id: channelId });
  };

  const handleToggleStatus = () => {
    updateMutation.mutate({
      id: channelId,
      data: { is_active: !isActive },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditChannel}>
            <Eye className="mr-2 h-4 w-4" />
            View & Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Make Draft
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={handleDeleteChannel}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the channel and remove all
              associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
