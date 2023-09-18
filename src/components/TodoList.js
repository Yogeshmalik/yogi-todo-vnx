import React, { useEffect, useState } from "react";
import {
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
import { where } from "firebase/firestore";

function TodoList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  // const [tagInput, setTagInput] = useState("");
  // const [allUsers, setAllUsers] = useState([]);
  const [shareTask, setShareTask] = useState("");

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
  //     const usersData = [];
  //     snapshot.forEach((doc) => {
  //       usersData.push({ id: doc.id, ...doc.data() });
  //     });
  //     setAllUsers(usersData);
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    if (user) {
      const userTasksQuery = query(
        collection(db, "tasks"),
        orderBy("timestamp"),
        where("userId", "==", user.uid)
      );

      const sharedTasksQuery = query(
        collection(db, "tasks"),
        where("shareTask", "==", user.email)
      );

      const userTasks = [];
      const sharedTasks = [];

      const unsubscribeUserTasks = onSnapshot(userTasksQuery, (snapshot) => {
        userTasks.length = 0;
        snapshot.forEach((doc) => {
          userTasks.push({ id: doc.id, ...doc.data() });
        });
        setTasks([...userTasks, ...sharedTasks]);
      });

      const unsubscribeSharedTasks = onSnapshot(
        sharedTasksQuery,
        (snapshot) => {
          sharedTasks.length = 0;
          snapshot.forEach((doc) => {
            sharedTasks.push({ id: doc.id, ...doc.data() });
          });
          setTasks([...userTasks, ...sharedTasks]);
        }
      );

      return () => {
        unsubscribeUserTasks();
        unsubscribeSharedTasks();
      };
    }
  }, [user]);

  const addTask = async (e) => {
    e.preventDefault();

    if (newTask && taskDescription) {
      try {
        const taggedUserEmails = taggedUsers.map((user) => user.email);

        await addDoc(collection(db, "tasks"), {
          text: newTask,
          description: taskDescription,
          timestamp: new Date(),
          userId: user.uid,
          completed: false,
          taggedUsers: taggedUserEmails,
          shareTask: shareTask,
        });

        setNewTask("");
        setTaskDescription("");
        setShareTask("");
        setTaggedUsers([]);

        alert("Task added");
        console.log(taggedUserEmails);
        console.log(
          "Task added= ",
          newTask + " Description= ",
          taskDescription
        );
      } catch (error) {
        alert("Task not added");
        console.error(error);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      alert("Task deleted");
    } catch (error) {
      alert("Task not deleted");
      console.error(error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        completed: !completed,
      });
      alert("Task Toggled!");
    } catch (error) {
      alert("Task not Toggled!");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-100 to-purple-300 p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h2>
      <h3 className="text-xl font-semibold mb-2">Your Tasks:</h3>
      <ul className="list-disc px-3 sm:px-10">
        {tasks.map((task, index) => (
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
              {task.shareTask && (
                <p className="text-gray-400 text-sm font-normal text-left pl-6">
                  Shared with: {task.shareTask}
                </p>
              )}
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
      <form type='submit' required className="mt-4 px-2 sm:px-10 ">
        <input
          type="text"
          placeholder="New Task"
          name="newTask"
          className="border rounded px-2 py-1 w-full"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          required
        />
        <textarea
          placeholder="Task Description"
          name="taskDescription"
          className="border rounded px-2 py-1 w-full mt-2"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          required
        ></textarea>
        <div className="mt-2">
          <input
            type="email"
            placeholder="Enter their Email to Share Task"
            name="shareTask"
            className="border rounded px-2 py-1 w-full"
            value={shareTask}
            onChange={(e) => setShareTask(e.target.value)}
          />
          <div className="mt-2 space-y-2">
            {shareTask && (
              <div className="flex items-center">
                <span className="text-blue-500">@{shareTask}</span>
              </div>
            )}
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
