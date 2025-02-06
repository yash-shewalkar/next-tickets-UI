"use client";
import { signOut } from "firebase/auth";
import { deleteCookie } from "cookies-next";
import { auth, db } from "@/configs/fireconfig";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const user = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State for Edit Modal
  const [editTicket, setEditTicket] = useState<any>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      alert("You must be logged in to view your tickets.");
      return;
    }

    const fetchTickets = async () => {
      try {
        const q = query(collection(db, "tickets"), where("createdBy.uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const ticketsList: any[] = [];
        querySnapshot.forEach((doc) => {
          ticketsList.push({ id: doc.id, ...doc.data() });
        });
        setTickets(ticketsList);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        alert("Failed to load your tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      deleteCookie("userRole");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Delete Ticket Function
  const handleDelete = async (ticketId: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      try {
        await deleteDoc(doc(db, "tickets", ticketId));
        setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
        alert("Ticket deleted successfully!");
      } catch (error) {
        console.error("Error deleting ticket:", error);
        alert("Failed to delete ticket.");
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (ticket: any) => {
    setEditTicket(ticket);
    setNewTitle(ticket.title);
    setNewDescription(ticket.description);
  };

  // Save Edits
  const handleSaveEdit = async () => {
    if (!editTicket) return;

    try {
      await updateDoc(doc(db, "tickets", editTicket.id), {
        title: newTitle,
        description: newDescription,
        updatedAt: Timestamp.now(),
      });

      setTickets(
        tickets.map((ticket) =>
          ticket.id === editTicket.id
            ? { ...ticket, title: newTitle, description: newDescription, updatedAt: Timestamp.now() }
            : ticket
        )
      );

      setEditTicket(null);
      alert("Ticket updated successfully!");
    } catch (error) {
      console.error("Error updating ticket:", error);
      alert("Failed to update ticket.");
    }
  };

  if (loading) return <p className="text-black">Loading tickets...</p>;

  return (
    <div className="flex flex-col h-screen max-w-full p-6 bg-gray-50 shadow-xl">
      <h1 className="text-3xl font-bold text-black mb-4">Client Dashboard</h1>
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 mb-6"
      >
        Logout
      </button>
      <h2 className="text-2xl font-semibold text-black mb-4">Your Tickets</h2>

      {tickets.length === 0 ? (
        <p className="text-gray-500">You have no raised tickets.</p>
      ) : (
        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="py-3 px-6 text-left border-b">Ticket ID</th>
                <th className="py-3 px-6 text-left border-b">Title</th>
                <th className="py-3 px-6 text-left border-b">Description</th>
                <th className="py-3 px-6 text-left border-b">Priority</th>
                <th className="py-3 px-6 text-left border-b">Category</th>
                <th className="py-3 px-6 text-left border-b">Status</th>
                <th className="py-3 px-6 text-left border-b">Assigned To</th>
                <th className="py-3 px-6 text-left border-b">Remarks</th>
                <th className="py-3 px-6 text-left border-b">Created At</th>
                <th className="py-3 px-6 text-left border-b">Updated At</th>
                <th className="py-3 px-6 text-left border-b">Attachments</th>
                <th className="py-3 px-6 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 text-black">
                  <td className="py-3 px-6 border-b">{ticket.id}</td>
                  <td className="py-3 px-6 border-b">{ticket.title}</td>
                  <td className="py-3 px-6 border-b">{ticket.description || "N/A"}</td>
                  <td className="py-3 px-6 border-b">{ticket.priority}</td>
                  <td className="py-3 px-6 border-b">{ticket.category}</td>
                  <td className="py-3 px-6 border-b">{ticket.status}</td>
                  <td className="py-3 px-6 border-b">{ticket.assignedTo || "Unassigned"}</td>
                  <td className="py-3 px-6 border-b">{ticket.remarks || "N/A"}</td>
                  <td className="py-3 px-6 border-b">{ticket.createdAt?.toDate().toLocaleString()}</td>
                  <td className="py-3 px-6 border-b">{ticket.updatedAt ? ticket.updatedAt.toDate().toLocaleString() : "N/A"}</td>
                  <td className="py-3 px-6 border-b">
                    {ticket.attachments ? (
                      <a href={ticket.attachments} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        View
                      </a>
                    ) : (
                      "No Attachments"
                    )}
                  </td>
                  <td className="py-3 px-6 border-b flex gap-4 justify-start">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold" onClick={() => openEditModal(ticket)}>
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 font-semibold" onClick={() => handleDelete(ticket.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {editTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-black mb-4">Edit Ticket</h2>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-2 border rounded-lg mb-2" />
            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full p-2 border rounded-lg mb-2" />
            <button onClick={handleSaveEdit} className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2">Save</button>
            <button onClick={() => setEditTicket(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
