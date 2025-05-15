import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Edit, Share } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6" />
            <span>MarkdownEditor</span>
          </div>

          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Create, Edit, and Share Markdown Documents
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  A simple and powerful markdown editor that lets you create, edit, and share your documents with
                  others.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              <div className="relative lg:pl-10">
                <div className="bg-muted border rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold">Example Document</div>
                    <div className="flex gap-2">
                      <Edit className="h-5 w-5 text-muted-foreground" />
                      <Share className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <h1>Welcome to MarkdownEditor</h1>
                    <p>This is an example of what your markdown documents will look like.</p>
                    <h2>Features:</h2>
                    <ul>
                      <li>Simple and intuitive editor</li>
                      <li>Real-time preview</li>
                      <li>Share with friends and colleagues</li>
                      <li>Secure document storage</li>
                    </ul>
                    <blockquote>
                      <p>
                        Markdown is a lightweight markup language that you can use to add formatting elements to
                        plaintext text documents.
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 items-center">
              <div className="flex flex-col justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                    Everything you need to create and manage your markdown documents
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6">
                  <Edit className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Rich Markdown Editor</h3>
                  <p className="text-muted-foreground text-center">
                    A powerful editor with syntax highlighting and real-time preview
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6">
                  <Share className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Easy Sharing</h3>
                  <p className="text-muted-foreground text-center">
                    Share your documents with friends and colleagues with custom permissions
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6">
                  <FileText className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Document Management</h3>
                  <p className="text-muted-foreground text-center">
                    Organize and manage all your markdown documents in one place
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} MarkdownEditor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
