import { getMessages } from "next-intl/server"
import { MessagesScope } from "@/components/providers/messages-scope"
import type { PageNamespace } from "@/lib/client-messages"

/** Wraps browser components that need one of the page-only message namespaces. */
export async function WithMessages({
  namespaces,
  children,
}: {
  namespaces: PageNamespace[]
  children: React.ReactNode
}) {
  const all = await getMessages()
  const picked = Object.fromEntries(namespaces.map((ns) => [ns, all[ns]]))
  return <MessagesScope messages={picked}>{children}</MessagesScope>
}
