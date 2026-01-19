import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { searchUsers } from "@/api/user.api";
import type { User } from "@/schema/auth.schema";
import { createConversation } from "@/api/chat.api";

export default function SearchUser({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState<User[]>([]);

  const onUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      return setSelectedUsers(
        selectedUsers.filter((selectedUserId) => selectedUserId !== userId),
      );
    }
    setSelectedUsers([...selectedUsers, userId]);
  };

  const getUser = (id: string) => {
    return results.find((user) => user.id === id)!;
  };

  useEffect(() => {
    if (query.length < 2) return;

    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const users = await searchUsers(query);
        setResults(users);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(id);
  }, [query]);

  const createNewConversation = async () => {
    try {
      await createConversation(selectedUsers);
      setOpen(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };
  const onChange = (value: string) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 p-0 outline-none">
        <DialogHeader className="px-4 pb-4 pt-5">
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Invite a user to this thread. This will create a new group message.
          </DialogDescription>
        </DialogHeader>
        <Command
          className="overflow-hidden rounded-t-none border-t bg-transparent"
          shouldFilter={false}
        >
          <CommandInput
            placeholder="Search user by name or email..."
            value={query}
            onValueChange={onChange}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : "No users found. "}
            </CommandEmpty>
            <CommandGroup className="p-2">
              {results.map((user: User) => (
                <CommandItem
                  key={user.id}
                  className="flex items-center px-2 cursor-pointer"
                  onSelect={() => onUserSelect(user.id)}
                >
                  <Avatar>
                    <AvatarImage src={""} alt="Image" />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  {selectedUsers.includes(user.id) ? (
                    <Check className="ml-auto flex h-5 w-5 text-primary" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
          {selectedUsers.length > 0 ? (
            <div className="flex -space-x-2 overflow-hidden">
              {selectedUsers.map((id) => (
                <Avatar
                  key={id}
                  className="inline-block border-2 border-background"
                >
                  <AvatarImage src={""} />
                  <AvatarFallback>{getUser(id).name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select users to add to this thread.
            </p>
          )}
          <Button
            disabled={selectedUsers.length < 1}
            onClick={createNewConversation}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
