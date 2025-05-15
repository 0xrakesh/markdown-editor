"use server"

import { createClient } from "@supabase/supabase-js"

export async function createDemoUser() {
  // Create a Supabase client with the service role key
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // Check if the demo user already exists
    const { data: existingUser } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", "demo@example.com")
      .maybeSingle()

    if (existingUser) {
      console.log("Demo user already exists")
      return { success: true, message: "Demo user already exists" }
    }

    // Create the demo user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "demo@example.com",
      password: "password123",
      email_confirm: true,
    })

    if (authError) {
      throw authError
    }

    if (!authUser.user) {
      throw new Error("Failed to create user")
    }

    // Create a profile for the user
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authUser.user.id,
        username: "demo",
      },
    ])

    if (profileError) {
      throw profileError
    }

    // Create some sample documents
    const { error: docsError } = await supabase.from("documents").insert([
      {
        title: "Welcome to MarkdownEditor",
        content: `# Welcome to MarkdownEditor

This is your first markdown document. You can edit it or create new ones.

## Features

- **Simple Editor**: Easy to use markdown editor
- **Real-time Preview**: See your changes as you type
- **Sharing**: Share your documents with others
- **Secure**: Your documents are stored securely

## Markdown Basics

### Headers

# H1
## H2
### H3

### Lists

- Item 1
- Item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

### Code

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Links and Images

[Link text](https://example.com)

![Image alt text](/placeholder.svg?height=200&width=400)

Enjoy using MarkdownEditor!`,
        owner_id: authUser.user.id,
        is_public: false,
      },
      {
        title: "Markdown Cheat Sheet",
        content: `# Markdown Cheat Sheet

This is a quick reference for markdown syntax.

## Basic Syntax

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Emphasis

*Italic text* or _Italic text_
**Bold text** or __Bold text__
***Bold and italic text*** or ___Bold and italic text___

### Lists

#### Unordered Lists

- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
- Item 3

#### Ordered Lists

1. Item 1
2. Item 2
   1. Nested item 1
   2. Nested item 2
3. Item 3

### Links

[Link text](https://www.example.com)
[Link with title](https://www.example.com "Title text")

### Images

![Alt text](/placeholder.svg?height=200&width=400)
![Alt text with title](/placeholder.svg?height=200&width=400 "Title text")

### Blockquotes

> This is a blockquote
>
> > This is a nested blockquote

### Horizontal Rules

---
***
___

### Code

Inline \`code\` has backticks around it.

\`\`\`
# Code block
print("Hello, world!")
\`\`\`

\`\`\`javascript
// JavaScript code with syntax highlighting
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Extended Syntax

### Tables

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

### Task Lists

- [x] Task 1
- [ ] Task 2
- [ ] Task 3

### Strikethrough

~~Strikethrough text~~

### Footnotes

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

### Emoji

:smile: :heart: :thumbsup:

### Highlight

==Highlighted text==

Enjoy using markdown!`,
        owner_id: authUser.user.id,
        is_public: true,
      },
    ])

    if (docsError) {
      throw docsError
    }

    return { success: true, message: "Demo user created successfully" }
  } catch (error) {
    console.error("Error creating demo user:", error)
    return { success: false, message: "Failed to create demo user" }
  }
}
