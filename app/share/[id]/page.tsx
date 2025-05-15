import { createServerClient } from "@/lib/supabase/server"
import { ShareDocument } from "@/components/editor/share-document"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

interface SharePageProps {
  params: {
    id: string
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const supabase = createServerClient()
  const { id } = params

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

  // Get the document
  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single()

  if (error || !document) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar username={profile?.username} />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Share "{document.title}"</h1>
            <Button asChild variant="outline">
              <Link href={`/editor/${id}`}>Back to Editor</Link>
            </Button>
          </div>
          <ShareDocument documentId={id} isPublic={document.is_public} />
        </div>
      </main>
    </div>
  )
}
