import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "./AddAgendaPage.css";
import Navbar from "../components/Navbar";

const AddAgenda = () => {
  const token = localStorage.getItem("token");

  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch notes from backend
  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:4400/api/notes", {
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

  // Add note
  const addNote = async () => {
    if (!newTitle.trim()) return;

    // Temporary note for optimistic UI
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
      const res = await fetch("http://localhost:4400/api/notes", {
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

  // Delete note
  const deleteNote = async (id) => {
    setNotes(notes.filter((note) => note._id !== id));
    if (!token) return;

    try {
      await fetch(`http://localhost:4400/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle complete
  const toggleComplete = async (id, completed) => {
    setNotes(
      notes.map((note) =>
        note._id === id ? { ...note, completed: !completed } : note
      )
    );

    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4400/api/notes/${id}`, {
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
    } catch (err) {
      console.error(err);
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
        autoFocus
      />

      <textarea
        className="paper-content"
        placeholder="Write your note..."
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
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
      <div className="tin-content">
        <h3>{note.title}</h3>
        <p>{note.content}</p>
        <div className="tin-actions">
          <button
            onClick={() => toggleComplete(note._id, note.completed)}
            className="tin-check"
          >
            {note.completed && <Check className="icon-small" />}
          </button>
          <button
            onClick={() => deleteNote(note._id)}
            className="tin-delete"
          >
            <Trash2 className="icon-small" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

        )}
      </main>


      <Footer />
    </div>
  );
};

export default AddAgenda;
