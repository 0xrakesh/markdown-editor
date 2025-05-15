import { createServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { notFound } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

interface ViewPageProps {
  params: {
    id: string
  }
}

export default async function ViewPage({ params }: ViewPageProps) {
  const supabase = createServerClient()
  const { id } = params

  // Get the current user (might be null for public documents)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single()
    profile = data
  }

  // Get the document
  const { data: document, error } = await supabase.from("documents").select("*").eq("id", id).single()

  if (error || !document) {
    notFound()
  }

  // Check if the document is public or the user has access
  if (!document.is_public && (!user || document.owner_id !== user.id)) {
    // Check if the document is shared with the user
    if (user) {
      const { data: sharedDocument, error: sharedError } = await supabase
        .from("shared_documents")
        .select("permission")
        .eq("document_id", id)
        .eq("shared_with", user.id)
        .single()

      if (sharedError || !sharedDocument) {
        notFound()
      }
    } else {
      notFound()
    }
  }

  // Get owner information
  const { data: owner } = await supabase.from("profiles").select("username").eq("id", document.owner_id).single()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar username={profile?.username} />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <p className="text-muted-foreground">Created by {owner?.username || "Unknown"}</p>
            </div>
            {user &&
              (document.owner_id === user.id || (
                <Button asChild variant="outline">
                </Button>
              ))}
          </div>

          <Card className="p-6 prose max-w-none">
            {document.content ? (
              <ReactMarkdown>{document.content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">This document is empty</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
