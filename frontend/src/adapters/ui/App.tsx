import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>Hello from react {count}</div>
    </>
  );
}

export default App;
