import { useState } from "react";
import type { Post } from "../lib/types";
import { uid } from "../lib/blueprint";
import { parseMarkdown, slugify } from "../lib/markdown";

type Props = {
  posts: Post[];
  onChange: (posts: Post[]) => void;
  onGenerateImage: (field: string) => Promise<string | null>;
  onGeneratePosts?: () => void;
  busy?: boolean;
};

export default function PostsView(p: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = (post: Post) => {
    p.onChange(p.posts.map((x) => (x.id === post.id ? post : x)));
  };

  const addPost = () => {
    const post: Post = {
      id: uid("post"),
      slug: `post-${Date.now().toString(36)}`,
      title: "New post",
      excerpt: "",
      content: "",
      date: new Date().toISOString(),
      category: "News",
    };
    p.onChange([post, ...p.posts]);
    setEditingId(post.id);
  };

  const remove = (id: string) => {
    p.onChange(p.posts.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const editing = p.posts.find((x) => x.id === editingId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="panel-label">Blog posts</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={addPost} disabled={p.busy}>
          + New post
        </button>
        {p.onGeneratePosts && (
          <button className="btn btn-ghost" style={{ whiteSpace: "nowrap" }} onClick={p.onGeneratePosts} disabled={p.busy}>
            ✦ Write 3 with AI
          </button>
        )}
        <label className="btn btn-ghost" style={{ whiteSpace: "nowrap" }}>
          Import .md
          <input
            type="file"
            accept=".md,.markdown,text/markdown,text/plain"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              f.text().then((txt) => {
                const post = parseMarkdown(txt);
                if (post) {
                  p.onChange([post, ...p.posts]);
                  setEditingId(post.id);
                } else {
                  window.alert("Could not parse that Markdown file — make sure it starts with front matter (title: …).");
                }
              });
            }}
          />
        </label>
      </div>

      {editing && (
        <div className="inspector-section">
          <div className="inspector-head">
            <b>Edit post</b>
            <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)}>
              Done
            </button>
          </div>
          <div className="json-field">
            <label>Title</label>
            <input
              value={editing.title}
              onChange={(e) => update({ ...editing, title: e.target.value, slug: slugify(e.target.value) })}
            />
          </div>
          <div className="json-field">
            <label>Slug</label>
            <input value={editing.slug} onChange={(e) => update({ ...editing, slug: slugify(e.target.value) })} />
          </div>
          <div className="json-field">
            <label>Category</label>
            <input value={editing.category ?? ""} onChange={(e) => update({ ...editing, category: e.target.value })} />
          </div>
          <div className="json-field">
            <label>Author</label>
            <input value={editing.author ?? ""} onChange={(e) => update({ ...editing, author: e.target.value })} />
          </div>
          <div className="json-field">
            <label>Date</label>
            <input type="date" value={editing.date.slice(0, 10)} onChange={(e) => update({ ...editing, date: new Date(e.target.value).toISOString() })} />
          </div>
          <div className="json-field">
            <label>Excerpt</label>
            <textarea rows={2} value={editing.excerpt} onChange={(e) => update({ ...editing, excerpt: e.target.value })} />
          </div>
          <div className="json-field">
            <label>Cover image</label>
            <div className="field-inline" style={{ gap: 6 }}>
              <input value={editing.cover ?? ""} onChange={(e) => update({ ...editing, cover: e.target.value })} />
              <button
                className="btn btn-sm btn-ghost"
                disabled={p.busy}
                onClick={async () => {
                  const url = await p.onGenerateImage("cover");
                  if (url) update({ ...editing, cover: url });
                }}
              >
                {p.busy ? "…" : "✦"}
              </button>
            </div>
            {editing.cover ? (
              <img src={editing.cover} alt="" style={{ width: "100%", borderRadius: 8, marginTop: 6, maxHeight: 160, objectFit: "cover" }} />
            ) : null}
          </div>
          <div className="json-field">
            <label>Body (HTML allowed)</label>
            <textarea rows={10} value={editing.content} onChange={(e) => update({ ...editing, content: e.target.value })} />
          </div>
          <button className="btn" style={{ width: "100%", color: "var(--chrome-danger, #c0392b)" }} onClick={() => remove(editing.id)}>
            Delete post
          </button>
        </div>
      )}

      {!editing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {p.posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✍️</div>
              <b>No posts yet</b>
              <p>Write one yourself, import a Markdown file, or let AI draft three in your site's voice.</p>
              {p.onGeneratePosts && (
                <button className="btn btn-primary" onClick={p.onGeneratePosts} disabled={p.busy}>
                  ✦ Write 3 with AI
                </button>
              )}
            </div>
          ) : (
            p.posts.map((post) => (
              <div key={post.id} className="inspector-section" style={{ padding: 10, cursor: "pointer" }} onClick={() => setEditingId(post.id)}>
                <b>{post.title}</b>
                <div style={{ fontSize: 11, color: "var(--chrome-faint)", marginTop: 2 }}>
                  {post.category ? `${post.category} · ` : ""}
                  {new Date(post.date).toLocaleDateString()} · /{post.slug}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
