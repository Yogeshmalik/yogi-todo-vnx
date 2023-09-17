import React, { useEffect, useState } from "react";
import {
  auth,
  db,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  collection,
} from "../firebase";

function TodoList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  // Load all users from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setAllUsers(usersData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "tasks", user.uid, "userTasks"),
        orderBy("timestamp")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = [];
        snapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() });
        });
        setTasks(tasksData);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const taskData = {
    text: newTask,
    description: taskDescription,
    timestamp: new Date(),
    userId: user.uid,
    completed: false,
    taggedUsers: taggedUsers,
  };

  const addTask = async () => {
    try {
      if (newTask && taskDescription) {
        const userTasksRef = collection(db, "tasks", user.uid, "userTasks");
        await addDoc(
          userTasksRef,
          taskData,
          { merge: true },
          orderBy("timestamp")
        );

        // Clear input fields and tagged users
        setNewTask("");
        setTaskDescription("");
        setTaggedUsers([]);

        console.log("Task added with ID: ", userTasksRef.id);
      }
    } catch (error) {
      alert("Task not added");
      console.error(error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", user.uid, "userTasks", taskId));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await updateDoc(doc(db, "tasks", user.uid, "userTasks", taskId), {
        completed: !completed,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);

    // users based on input
    const filteredUsers = allUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(value.toLowerCase()) &&
        user.uid !== auth.currentUser.uid
    );
    setTaggedUsers(filteredUsers);
  };

  const handleTagUser = (selectedUser) => {
    // tagged users list
    setTaggedUsers([...taggedUsers, selectedUser]);

    setTagInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-100 to-purple-300 p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h2>
      <h3 className="text-xl font-semibold mb-2">Your Tasks:</h3>
      <ul className="list-disc px-3 sm:px-10">
        {tasks.map((task, index) => (
          // <li key={task.id} className="flex items-center justify-between py-2">
          <li
            key={task.id}
            className={`text-lg font-bold flex items-center justify-between p-2 rounded-lg my-2 
              transform hover:scale-105 transition-transform ease-in-out duration-500 ${
                task.completed
                  ? "bg-gradient-to-r from-red-300 to-orange-200"
                  : "bg-gradient-to-r from-lime-200 to-emerald-300 w-full"
              }`}
          >
            <div className=" pr-5 flex flex-col">
              <span className="inline-flex">
                {index + 1}.{" "}
                <span
                  className={`text-lg font-bold flex cursor-pointer px-2 ${
                    task.completed
                      ? "line-through line text-red-700"
                      : "text-green-700 w-full"
                  }`}
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  {task.text}
                </span>
              </span>
              <p className="text-gray-800 font-normal text-left pl-6">
                {task.description}
              </p>
            </div>
            <button
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form required className="mt-4 px-2 sm:px-10 ">
        <input
          type="text"
          placeholder="New Task"
          className="border rounded px-2 py-1 w-full"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          required
        />
        <textarea
          placeholder="Task Description"
          className="border rounded px-2 py-1 w-full mt-2"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          required
        ></textarea>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Tag Users (@username)"
            className="border rounded px-2 py-1 w-full"
            value={tagInput}
            onChange={handleTagInputChange}
          />
          <div className="mt-2 space-y-2">
            {taggedUsers.map((taggedUser) => (
              <div key={taggedUser.id} className="flex items-center">
                <span className="text-blue-500" onChange={handleTagUser}>
                  @{taggedUser.email}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 mt-2"
          onClick={addTask}
        >
          Add Task
        </button>
      </form>
    </div>
  );
}

export default TodoList;
