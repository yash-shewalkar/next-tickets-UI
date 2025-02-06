"use client";
import React, { useState } from "react";
import { db } from "@/configs/fireconfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const TicketForm = () => {
  const user = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [category, setCategory] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "tickets"), {
        title,
        description,
        priority,
        status: "open", // Default status
        category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: {
          uid: user?.uid,
        },
        assignedTo: null, // Initially NULL
        attachments: attachment ? attachment.name : null, // Store file name, actual upload needs storage
        remarks: null, // Default value for remarks (only agent can update this)
      });

      alert("Ticket created successfully!");
      setTitle("");
      setDescription("");
      setPriority("low");
      setCategory("");
      setAttachment(null);
    } catch (error) {
      console.error("Error adding ticket:", error);
      alert("Failed to create ticket.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Raise a Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        >
          <option value="">Select Category</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical Issue</option>
          <option value="general">General Inquiry</option>
        </select>
        <input
          type="file"
          onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
