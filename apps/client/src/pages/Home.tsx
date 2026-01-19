import { ChatWindow } from "@/components/chat/ChatWindow";
import SearchUser from "@/components/user/SearchUser";

import { useStore } from "@/store/store";

export default function Home() {
  const { isSearchOpen, setIsSearchOpen } = useStore();

  return (
    <>
      <SearchUser open={isSearchOpen} setOpen={setIsSearchOpen} />
      <ChatWindow />
    </>
  );
}
