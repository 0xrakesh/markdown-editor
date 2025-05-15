"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database } from "@/lib/database.types"
import { Edit, MoreHorizontal, Plus, Share, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Document = Database["public"]["Tables"]["documents"]["Row"]
type SharedDocument = {
  document: Document
  permission: string
}

interface DocumentListProps {
  ownedDocuments: Document[]
  sharedDocuments: SharedDocument[] | any
}

export function DocumentList({
  ownedDocuments: initialOwnedDocs,
  sharedDocuments: initialSharedDocs,
}: DocumentListProps) {
  const [ownedDocuments, setOwnedDocuments] = useState<Document[]>(initialOwnedDocs)
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>(initialSharedDocs)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredOwnedDocs = ownedDocuments.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredSharedDocs = sharedDocuments.filter((shared) =>
    shared.document.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateNew = () => {
    router.push("/editor/new")
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id)

      if (error) throw error

      setOwnedDocuments(ownedDocuments.filter((doc) => doc.id !== id))
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const renderDocumentCard = (doc: Document, isOwner = true, permission?: string) => (
    <Card key={doc.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{doc.title}</CardTitle>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/editor/${doc.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/share/${doc.id}`}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription>
          Last updated {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
          {!isOwner && permission && (
            <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded-full">
              {permission === "read" ? "Read only" : "Can edit"}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-24 overflow-hidden text-sm text-muted-foreground">
        {doc.content ? <div className="line-clamp-4">{doc.content}</div> : <p className="italic">No content</p>}
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Button asChild variant="ghost" className="w-full">
          <Link href={`/view/${doc.id}`}>Open Document</Link>
        </Button>
      </CardFooter>
    </Card>
  )

return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      <Tabs defaultValue="owned">
        <TabsList>
          <TabsTrigger value="owned">My Documents</TabsTrigger>
          <TabsTrigger value="shared">Shared With Me</TabsTrigger>
        </TabsList>
        <TabsContent value="owned" className="mt-6">
          {filteredOwnedDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOwnedDocs.map((doc) => renderDocumentCard(doc))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No documents found</p>
              <Button onClick={handleCreateNew} variant="outline" className="mt-4">
                Create your first document
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="shared" className="mt-6">
          {filteredSharedDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSharedDocs.map((shared) => renderDocumentCard(shared.document, false, shared.permission))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No shared documents found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
