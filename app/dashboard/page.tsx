import { createServerClient } from "@/lib/supabase/server"
import { DocumentList } from "@/components/dashboard/document-list"
import { Navbar } from "@/components/layout/navbar"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

  // Get user's documents
  const { data: ownedDocuments } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })

  // Get documents shared with the user
  const { data: sharedWithUser } = await supabase
    .from("shared_documents")
    .select(`
      permission,
      document:document_id(*)
    `)
    .eq("shared_with", user.id)

  const sharedDocuments =
    sharedWithUser?.map((item) => ({
      document: item.document as unknown as Document,
      permission: item.permission,
    })) || []

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar username={profile?.username} />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Documents</h1>
        <DocumentList ownedDocuments={ownedDocuments || []} sharedDocuments={sharedDocuments} />
      </main>
    </div>
  )
}
