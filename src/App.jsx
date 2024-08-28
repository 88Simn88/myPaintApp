import Canvas from "./components/Canvas"

const App = () => {

  return (
    <div
    className="h-full w-full"
    >

    <h1 className="text-3xl font-bold p-5">
      My <span
      className="text-blue-500"
      >Paint</span> App
    </h1>
    
    <Canvas />

    </div>
  )
}

export default App