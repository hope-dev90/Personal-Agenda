import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Calendar, X, Pencil } from "lucide-react";
import Footer from "../components/Footer";
import "./AddAgendaPage.css";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/api";

const AddAgenda = () => {
  const token = localStorage.getItem("token");

  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  
  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return;
      try {
        const res = await fetch(apiUrl("/api/notes"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotes();
  }, [token]);

  
  const addNote = async () => {
    if (!newTitle.trim()) return;

    
    const tempId = crypto.randomUUID();
    const tempNote = {
      _id: tempId,
      title: newTitle.trim(),
      content: newContent.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setNotes([tempNote, ...notes]);
    setNewTitle("");
    setNewContent("");
    setIsAdding(false);

    if (!token) return;

    try {
      const res = await fetch(apiUrl("/api/notes"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: tempNote.title,
          content: tempNote.content,
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");
      const savedNote = await res.json();

 
      setNotes((prev) =>
        prev.map((note) => (note._id === tempId ? savedNote : note))
      );
    } catch (err) {
      console.error(err);
      
      setNotes((prev) => prev.filter((note) => note._id !== tempId));
    }
  };

  const deleteNote = async (id) => {
    const previousNotes = notes;
    setNotes((prev) => prev.filter((note) => note._id !== id));
    if (selectedNote?._id === id) {
      closeNoteViewer();
    }
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/notes/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete note");
    } catch (err) {
      console.error(err);
      setNotes(previousNotes);
    }
  };

  const toggleComplete = async (id, completed) => {
    const previousNotes = notes;
    setNotes((prev) =>
      prev.map((note) =>
        note._id === id ? { ...note, completed: !completed } : note
      )
    );

    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/notes/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      const updatedNote = await res.json();
      setNotes((prev) =>
        prev.map((note) => (note._id === id ? updatedNote : note))
      );
      if (selectedNote?._id === id) {
        setSelectedNote(updatedNote);
        setEditTitle(updatedNote.title || "");
        setEditContent(updatedNote.content || "");
      }
    } catch (err) {
      console.error(err);
      setNotes(previousNotes);
    }
  };

  const openNoteViewer = (note) => {
    setSelectedNote(note);
    setEditTitle(note.title || "");
    setEditContent(note.content || "");
  };

  const closeNoteViewer = () => {
    setSelectedNote(null);
    setEditTitle("");
    setEditContent("");
    setIsSavingEdit(false);
  };

  const saveNoteChanges = async () => {
    if (!selectedNote || !editTitle.trim() || !token) return;

    setIsSavingEdit(true);

    try {
      const res = await fetch(
        apiUrl(`/api/notes/${selectedNote._id}`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            content: editContent.trim(),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save note changes");

      const updatedNote = await res.json();

      setNotes((prev) =>
        prev.map((note) => (note._id === updatedNote._id ? updatedNote : note))
      );
      setSelectedNote(updatedNote);
      setEditTitle(updatedNote.title || "");
      setEditContent(updatedNote.content || "");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey && newTitle.trim()) addNote();
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey && editTitle.trim()) {
      saveNoteChanges();
    }
  };

  return (
    <div className="agenda-page">
      <Navbar/>
      <main className="agenda-container">
        {/* Header */}
        <div className="first">
          <div className="agenda-header">
            <h1>My Agenda</h1>
          </div>
          <img
            src={require("../assets/girl-writing.png")}
            alt="Girl writing in agenda"
            className="empty-image"
          />
          <button onClick={() => setIsAdding(true)} className="firstb">
            <Plus className="icon" /> New Note
          </button>
        </div>

        {/* Add Note – Paper Style */}
{isAdding && (
  <div className="paper-overlay">
    <div className="paper-note">
      <input
        className="paper-title"
        type="text"
        placeholder="Title"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      <textarea
        className="paper-content"
        placeholder="Write your note..."
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="paper-actions">
        <button
          className="btn-secondary"
          onClick={() => {
            setIsAdding(false);
            setNewTitle("");
            setNewContent("");
          }}
        >
          Cancel
        </button>

        <button
          className="notebtn"
          onClick={addNote}
          disabled={!newTitle.trim()}
        >
          Save Note
        </button>
      </div>
    </div>
  </div>
)}

        {/* Notes List */}
        {notes.length === 0 && !isAdding ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar className="icon-large" />
            </div>
            <h2>No notes yet</h2>
            <p>Start capturing your thoughts and tasks</p>
            <button onClick={() => setIsAdding(true)} className="secondb">
              <Plus className="icon" /> Create your first note
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div className="tin-note" key={note._id}>
                <button
                  type="button"
                  className="tin-open"
                  onClick={() => openNoteViewer(note)}
                >
                  <div className="tin-content">
                    <h3>{note.title}</h3>
                    <p>{note.content}</p>
                    <span className="tin-read-more">Open and read more</span>
                  </div>
                </button>
                <div className="tin-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(note._id, note.completed);
                    }}
                    className="tin-check"
                  >
                    {note.completed && <Check className="icon-small" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note._id);
                    }}
                    className="tin-delete"
                  >
                    <Trash2 className="icon-small" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        )}
      </main>

      {selectedNote && (
        <div className="paper-overlay" onClick={closeNoteViewer}>
          <div
            className="paper-note paper-note-viewer"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="viewer-close"
              onClick={closeNoteViewer}
              aria-label="Close note"
            >
              <X className="icon" />
            </button>

            <div className="viewer-badge">
              <Pencil className="icon-small" />
              Edit note
            </div>

            <input
              className="paper-title"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleEditKeyDown}
            />

            <textarea
              className="paper-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleEditKeyDown}
            />

            <div className="paper-meta">
              Last updated {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}
            </div>

            <div className="paper-actions">
              <button className="btn-secondary" onClick={closeNoteViewer}>
                Close
              </button>
              <button
                className="notebtn"
                onClick={saveNoteChanges}
                disabled={!editTitle.trim() || isSavingEdit}
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}


      <Footer />
    </div>
  );
};

export default AddAgenda; 
