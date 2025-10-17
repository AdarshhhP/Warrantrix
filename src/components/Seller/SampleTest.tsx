import {
  createContext,
  useContext,
  useEffect,
  useState,
  useReducer,
  useCallback,
} from "react";

// Create a Context
const UserContext = createContext<string>("");

// Reducer function
function counterReducer(state: number, action: { type: string }) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "reset":
      return 0;
    default:
      return state;
  }
}

const SampleTest = () => {
  const [number, setnumber] = useState(8);
  const [calluseEffect, setcalluseEffect] = useState(false);

  // useReducer
  const [count, dispatch] = useReducer(counterReducer, 0);

  // useCallback — memoizes the function so it doesn’t re-create on every render
  const handleIncrement = useCallback(() => {
    dispatch({ type: "increment" });
  }, []); // no dependencies → stable reference

  useEffect(() => {
    setnumber((prev) => prev + 1);
  }, [calluseEffect]);

  return (
    <div>
      <span>useState number: {number}</span>
      <br />
      <button onClick={() => setcalluseEffect(!calluseEffect)}>
        call useEffect
      </button>

      <hr />

      <h3>useReducer + useCallback Example:</h3>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={() => dispatch({ type: "decrement" })}>Decrement</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>

      <hr />

      <UserContext.Provider value={"bency"}>
        <Component5 />
      </UserContext.Provider>
    </div>
  );
};

export default SampleTest;

function Component5() {
  const user = useContext(UserContext);

  return (
    <>
      <h1>Component 5</h1>
      <h2>{`Hello ${user} again!`}</h2>
    </>
  );
}
