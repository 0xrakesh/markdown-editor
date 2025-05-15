"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Share, Trash2, Copy, Check } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type SharedDocument = Database["public"]["Tables"]["shared_documents"]["Row"] & {
  profiles: Profile | null
}

interface ShareDocumentProps {
  documentId: string
  isPublic: boolean
}

export function ShareDocument({ documentId, isPublic }: ShareDocumentProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState("read")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sharedWith, setSharedWith] = useState<SharedDocument[]>([])
  const [publicStatus, setPublicStatus] = useState(isPublic)
  const [copied, setCopied] = useState(false)

  // Fetch shared users
  useEffect(() => {
    const fetchSharedUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("shared_documents")
          .select(`
            *,
            profiles:shared_with(id, username, avatar_url)
          `)
          .eq("document_id", documentId)

        if (error) throw error

        setSharedWith(data as SharedDocument[])
      } catch (error) {
        console.error("Error fetching shared users:", error)
      }
    }

    fetchSharedUsers()
  }, [documentId])

  // Handle sharing document
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Find user by email
      const { data: users, error: userError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", email)
        .single()

      if (userError) {
        throw new Error("User not found")
      }

      // Check if already shared
      const { data: existingShares, error: shareCheckError } = await supabase
        .from("shared_documents")
        .select("*")
        .eq("document_id", documentId)
        .eq("shared_with", users.id)

      if (shareCheckError) throw shareCheckError

      if (existingShares && existingShares.length > 0) {
        // Update existing share
        const { error: updateError } = await supabase
          .from("shared_documents")
          .update({ permission })
          .eq("id", existingShares[0].id)

        if (updateError) throw updateError

        setSuccess(`Updated sharing permissions for ${email}`)
      } else {
        // Create new share
        const { error: insertError } = await supabase.from("shared_documents").insert([
          {
            document_id: documentId,
            shared_with: users.id,
            permission,
          },
        ])

        if (insertError) throw insertError

        setSuccess(`Document shared with ${email}`)
      }

      // Refresh the list
      const { data, error } = await supabase
        .from("shared_documents")
        .select(`
          *,
          profiles:shared_with(id, username, avatar_url)
        `)
        .eq("document_id", documentId)

      if (error) throw error

      setSharedWith(data as SharedDocument[])
      setEmail("")
    } catch (error: any) {
      setError(error.message || "An error occurred while sharing")
    } finally {
      setLoading(false)
    }
  }

  // Handle removing share
  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase.from("shared_documents").delete().eq("id", shareId)

      if (error) throw error

      setSharedWith(sharedWith.filter((share) => share.id !== shareId))
      setSuccess("Sharing removed successfully")
    } catch (error: any) {
      setError(error.message || "An error occurred while removing share")
    }
  }

  // Handle toggling public status
  const handleTogglePublic = async () => {
    try {
      const newStatus = !publicStatus

      const { error } = await supabase.from("documents").update({ is_public: newStatus }).eq("id", documentId)

      if (error) throw error

      setPublicStatus(newStatus)
      setSuccess(`Document is now ${newStatus ? "public" : "private"}`)
    } catch (error: any) {
      setError(error.message || "An error occurred while updating public status")
    }
  }

  // Handle copying share link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/view/${documentId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share className="mr-2 h-5 w-5" />
          Share Document
        </CardTitle>
        <CardDescription>Share this document with others or make it public</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Public toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="public-toggle">Make document public</Label>
            <p className="text-sm text-muted-foreground">Anyone with the link can view this document</p>
          </div>
          <Switch id="public-toggle" checked={publicStatus} onCheckedChange={handleTogglePublic} />
        </div>

        {/* Share link */}
        {publicStatus && (
          <div className="flex items-center gap-2">
            <Input
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/view/${documentId}`}
              readOnly
            />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Share with user form */}
        <form onSubmit={handleShare} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Username to share with</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter username"
                className="flex-1"
              />
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Can read</SelectItem>
                  <SelectItem value="write">Can edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading || !email}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Shared with list */}
        {sharedWith.length > 0 && (
          <div className="space-y-2">
            <Label>Shared with</Label>
            <div className="space-y-2">
              {sharedWith.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <p className="font-medium">{share.profiles?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {share.permission === "read" ? "Can read" : "Can edit"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveShare(share.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
