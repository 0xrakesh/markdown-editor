"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import { debounce } from "lodash"
import "highlight.js/styles/github.css"

interface MarkdownEditorProps {
  documentId?: string
  initialTitle?: string
  initialContent?: string
}

export function MarkdownEditor({ documentId, initialTitle = "", initialContent = "" }: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const router = useRouter()

  const debouncedSave = useCallback(
    debounce(async (title: string, content: string) => {
      if (!title) return
      setSaving(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        if (documentId) {
          await supabase
            .from("documents")
            .update({ title, content, updated_at: new Date().toISOString() })
            .eq("id", documentId)
        } else {
          const { data, error } = await supabase
            .from("documents")
            .insert([{ title, content, owner_id: user.id }])
            .select()
          if (error) throw error
          if (data && data[0]) router.push(`/editor/${data[0].id}`)
        }
      } catch (error) {
        console.error("Error saving document:", error)
      } finally {
        setSaving(false)
      }
    }, 1000),
    [documentId, router]
  )

  useEffect(() => {
    if (title) debouncedSave(title, content)
  }, [title, content, debouncedSave])

  const handleManualSave = async () => {
    debouncedSave.cancel()
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      if (documentId) {
        await supabase
          .from("documents")
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq("id", documentId)
      } else {
        const { data, error } = await supabase
          .from("documents")
          .insert([{ title, content, owner_id: user.id }])
          .select()
        if (error) throw error
        if (data && data[0]) router.push(`/editor/${data[0].id}`)
      }
    } catch (error) {
      console.error("Error saving document:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title"
          className="text-xl font-semibold"
        />
        <Button onClick={handleManualSave} disabled={saving || !title}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your markdown here..."
            className="min-h-[60vh] font-mono text-sm p-4"
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <Card className="p-4 min-h-[60vh]">
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

