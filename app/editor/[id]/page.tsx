import { createServerClient } from "@/lib/supabase/server"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { Navbar } from "@/components/layout/navbar"
import { notFound, redirect } from "next/navigation"

interface EditorPageProps {
  params: {
    id: string
  }
}

export default async function EditorPage({ params }: EditorPageProps) {
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

  // If it's a new document, render the editor with empty content
  if (id === "new") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar username={profile?.username} />
        <main className="flex-1">
          <MarkdownEditor />
        </main>
      </div>
    )
  }

  // Get the document
  const { data: document, error } = await supabase.from("documents").select("*").eq("id", id).single()

  if (error || !document) {
    // Check if the document is shared with the user
    const { data: sharedDocument, error: sharedError } = await supabase
      .from("shared_documents")
      .select(`
        permission,
        document:document_id(*)
      `)
      .eq("document_id", id)
      .eq("shared_with", user.id)
      .single()

    if (sharedError || !sharedDocument) {
      notFound()
    }

    // If the user only has read permission, redirect to view page
    if (sharedDocument.permission === "read") {
      redirect(`/view/${id}`)
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Navbar username={profile?.username} />
        <main className="flex-1">
          <MarkdownEditor
            documentId={id}
            initialTitle={sharedDocument.document?.title}
            initialContent={sharedDocument.document?.content || ""}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar username={profile?.username} />
      <main className="flex-1">
        <MarkdownEditor documentId={id} initialTitle={document.title} initialContent={document.content || ""} />
      </main>
    </div>
  )
}
