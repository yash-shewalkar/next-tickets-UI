"use client";
import { signOut } from "firebase/auth";
import { deleteCookie } from "cookies-next";
import { auth, db } from "@/configs/fireconfig";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

export default function AgentDashboard() {
  const router = useRouter();
  const user = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State for status update and remarks per ticket
  const [remarksToUpdate, setRemarksToUpdate] = useState<{ [ticketId: string]: string }>({});
  const [statusToUpdate, setStatusToUpdate] = useState<{ [ticketId: string]: string }>({});
  const [selectedAgent, setSelectedAgent] = useState("");

  useEffect(() => {
    if (!user) {
      alert("You must be logged in as an agent.");
      return;
    }

    const fetchTickets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const ticketsList: any[] = [];
        querySnapshot.forEach((doc) => {
          ticketsList.push({ id: doc.id, ...doc.data() });
        });
        setTickets(ticketsList);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        alert("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    const fetchAgents = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, "users")));
        const agentsList: any[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.role === "agent") {
            agentsList.push({ uid: userData.uid, email: userData.email });
          }
        });
        setAgents(agentsList);
      } catch (error) {
        console.error("Error fetching agents:", error);
        alert("Failed to load agents.");
      }
    };

    fetchTickets();
    fetchAgents();
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

  // Assign Ticket to Another Agent
  const handleAssignAgent = async (ticketId: string) => {
    if (!selectedAgent) return;

    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        assignedTo: selectedAgent, // Store only the agent email
        updatedAt: Timestamp.now(),
      });

      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, assignedTo: selectedAgent } : ticket
        )
      );

      alert("Ticket reassigned successfully!");
    } catch (error) {
      console.error("Error reassigning ticket:", error);
      alert("Failed to reassign ticket.");
    }
  };

  // Change Status for a Specific Ticket
  const handleChangeStatus = async (ticketId: string) => {
    if (!statusToUpdate[ticketId]) return;

    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        status: statusToUpdate[ticketId],
        updatedAt: Timestamp.now(),
      });

      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: statusToUpdate[ticketId] } : ticket
        )
      );
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  // Update Remarks for a Specific Ticket
  const handleUpdateRemarks = async (ticketId: string) => {
    const newRemarks = remarksToUpdate[ticketId];
    if (!newRemarks) return;

    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        remarks: newRemarks,
        updatedAt: Timestamp.now(),
      });

      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, remarks: newRemarks } : ticket
        )
      );

      alert("Remarks updated successfully!");
    } catch (error) {
      console.error("Error updating remarks:", error);
      alert("Failed to update remarks.");
    }
  };

  // Conditional color based on priority
  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "text-red-600";
    if (priority === "Medium") return "text-orange-600";
    if (priority === "Low") return "text-green-600";
    return "text-gray-500";
  };

  // Conditional color based on status
  const getStatusColor = (status: string) => {
    if (status === "Open") return "text-blue-600";
    if (status === "Resolved") return "text-green-600";
    if (status === "In Progress") return "text-yellow-600";
    return "text-gray-500";
  };

  if (loading) return <p>Loading tickets...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header with Logout button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-black">Agent Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none transition duration-200"
          >
            Logout
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-black mb-4">All Client Tickets</h2>

        {tickets.length === 0 ? (
          <p className="text-black">No tickets available.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Ticket ID</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Title</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Priority</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Category</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Assigned To</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Description</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Attachments</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Created At</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Updated At</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm text-black">{ticket.id}</td>
                    <td className="py-2 px-4 border-b text-sm text-black">{ticket.title}</td>
                    <td className={`py-2 px-4 border-b text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</td>
                    <td className="py-2 px-4 border-b text-sm text-black">{ticket.category}</td>
                    <td className={`py-2 px-4 border-b text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                      <select
                        value={statusToUpdate[ticket.id] || ticket.status}
                        onChange={(e) => setStatusToUpdate({ ...statusToUpdate, [ticket.id]: e.target.value })}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <button
                        onClick={() => handleChangeStatus(ticket.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
                      >
                        Update Status
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-black">
                      <select
                        value={ticket.assignedTo}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="">Assign Agent</option>
                        {agents.map((agent) => (
                          <option key={agent.uid} value={agent.email}>
                            {agent.email}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignAgent(ticket.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
                      >
                        Assign Agent
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-black">{ticket.description}</td>
                    <td className="py-2 px-4 border-b text-sm text-black">
                      {ticket.attachments ? (
                        <a href={ticket.attachments} target="_blank" rel="noopener noreferrer">View</a>
                      ) : "No attachments"}
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-black">{new Date(ticket.createdAt.seconds * 1000).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b text-sm text-black">{new Date(ticket.updatedAt?.seconds * 1000).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b text-sm text-black">
                      <input
                        type="text"
                        value={remarksToUpdate[ticket.id] || ticket.remarks || ""}
                        onChange={(e) => setRemarksToUpdate({ ...remarksToUpdate, [ticket.id]: e.target.value })}
                        className="px-2 py-1 border rounded"
                        placeholder="Enter or edit remarks"
                      />
                      <button
                        onClick={() => handleUpdateRemarks(ticket.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg"
                      >
                        Save Remark
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
