import React, { useEffect, useState } from "react";
import "./App.css";
import { auth, onAuthStateChanged, signOut } from "./firebase";
import TodoList from "./components/TodoList";
import SignIn from "./components/SignIn";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App items-center min-h-screen">
      <div className="flex justify-between items-center sticky top-0 z-50 bg-blue-500">
        <h2 className=" text-lg sm:text-2xl font-semibold px-3 py-1 text-white">
          <a href="https://www.linkedin.com/in/ysmworking/">YSM Tech.</a>
        </h2>
        <h2 className="text-lg sm:text-2xl font-semibold pr-5 text-white">
          Todo App
        </h2>
        {user && (
          <button
            className="bg-red-500 text-white font-bold px-3 py-1 mr-2 rounded hover:bg-red-600 cursor-pointer"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        )}
      </div>
      {user ? <TodoList user={user} /> : <SignIn />}
      <footer className="items-center bg-blue-500 text-center py-2 sticky bottom-0">
        <h1 className="inline-block font-semibold text-white">
          MADE BY
          <a
            className="inline-block pl-2 ease-out font-bold hover:scale-150 hover:text-[#fD5B61] transition duration-150"
            href="https://yogeshmalikportfolio.netlify.app/"
          >
            YSM
          </a>
        </h1>
      </footer>
    </div>
  );
}

export default App;
