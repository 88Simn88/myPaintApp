import { useEffect, useRef, useState } from "react";
import Menu from "./Menu";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faEraser, faFont, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';


const Canvas = () => {

  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5); // Estado para el grosor inicial del pincel
  const [isErasing, setIsErasing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000"); // Comienza en negro
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: "" });
  const [loadedImage, setLoadedImage] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSave = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    //Crear un fondo blanco
    ctx.globalCompositeOperation = "destination-over"
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //guardar la imagen
    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = "my-painting.png"
    link.click()
  }

  const handleOpen = (event) => {
    const file = event.target.files[0]

    if (!file) {//verifica que haya un documento seleccionado
      alert("Por favor, selecciona un archivo de imagen.")
      return
    }
    const reader = new FileReader()


    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setLoadedImage(img)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (loadedImage) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, canvas.width, canvas.height) //Limpia el canvas
      ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height)// dibuja la imagen cargada */
    }
  }, [loadedImage]

  )
  const getAdjustedPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); // Obtener el tamaño y posición del canvas en la pantalla

    //calcular la escala del canvas
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const offsetX = (event.clientX ? event.clientX - rect.left : event.touches[0].clientX - rect.left) * scaleX;
    const offsetY = (event.clientY ? event.clientY - rect.top : event.touches[0].clientY - rect.top) * scaleY;

    return { offsetX, offsetY };
  };

  const startDrawing = (event) => {
    const { offsetX, offsetY } = getAdjustedPosition(event);
    if (isTextMode) return;

    const context = canvasRef.current.getContext("2d");
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.strokeStyle = isErasing ? "white" : brushColor; // Cambia a blanco si está activada la goma
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setDrawing(true);
  };

  const draw = (event) => {
    if (!drawing || isTextMode) return;
    const { offsetX, offsetY } = getAdjustedPosition(event);

    const context = canvasRef.current.getContext("2d");
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };



  const stopDrawing = () => {
    if (isTextMode) return;
    const context = canvasRef.current.getContext("2d");
    context.closePath();
    setDrawing(false);
  };

  const handleCanvasDoubleClick = (event) => {
    if (!isTextMode) return; // Solo permitir si está en modo texto
    const { offsetX, offsetY } = getAdjustedPosition(event.nativeEvent);

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    const parentRect = canvas.parentElement.getBoundingClientRect();

    const scaleX = rect.width / canvas.width
    const scaleY = rect.height / canvas.height

    const adjustedX = offsetX * scaleX + rect.left - parentRect.left;
    const adjustedY = offsetY * scaleY + rect.top - parentRect.top;

    setTextInput({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      canvasX: offsetX,
      canvasY: offsetY,
      value: ""
    });
  };

  const handleTextInputChange = (e) => {
    setTextInput({ ...textInput, value: e.target.value });
  };


  const handleTextInputSubmit = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      const context = canvasRef.current.getContext("2d");
      context.font = `${brushSize * 2}px Arial`; // Ajusta el tamaño del texto según el tamaño del pincel
      context.fillStyle = brushColor;

      context.fillText(textInput.value, textInput.canvasX, textInput.canvasY); // Dibuja texto en la posición seleccionada
      setTextInput({ visible: false, x: 0, y: 0, value: "" });
    }
  };



  return (
    <div className="relative h-full w-full flex md:flex-row flex-col">

      {/* Menú hamburguesa solo visible en dispositivos móviles */}
      <div className={`fixed top-0 left-0 h-3/5 w-2/3 bg-gray-200 z-50 
            transform ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
            transition-transform duration-300 md:hidden`}>

        <button
          className="absolute top-4 right-4 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={faTimes} aria-hidden="true" size="2x" />

        </button>
        <div className="flex flex-col items-start ">

          <div className=" flex flex-col  mt-10">
            <h2
              className="text-3xl font-bold pl-4 mb-7"
            >Tools</h2>
            <Menu onSave={handleSave} onOpen={handleOpen} />
            <div
              className="h-full w-full m-auto flex flex-wrap  gap-5 p-7 mb-5"
            >

              <label htmlFor="brushSize">Brush Size: {brushSize} px</label>
              <input
                className="w-full"
                id="brushSize"
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
              />
              <button
                className={`rounded p-2 text-xl hover:scale-90 ${!isErasing ? "bg-lime-500" : "bg-gray-300"
                  }`}
                onClick={() => { setIsErasing(false); setIsTextMode(false), setMenuOpen(!menuOpen) }}
              >
                <FontAwesomeIcon icon={faPaintBrush} aria-hidden="true" />
              </button>
              <button
                className={`rounded p-2 text-xl hover:scale-90 ${isErasing ? "bg-lime-500" : "bg-gray-300"
                  }`}
                onClick={() => { setIsErasing(true); setIsTextMode(false); setMenuOpen(!menuOpen) }}
              >
                <FontAwesomeIcon icon={faEraser} aria-hidden="true" />
              </button>
              <button
                className={`rounded p-2 text-xl hover:scale-90 ${isTextMode ? "bg-lime-500" : "bg-gray-300"
                  }`}
                onClick={() => {
                  setIsTextMode(true);
                  setIsErasing(false);
                  setMenuOpen(!menuOpen)
                }}
              >
                <FontAwesomeIcon icon={faFont} aria-hidden="true" />
              </button>
              <input
                className="w-full "
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)} // Actualiza el color del pincel
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón para abrir el menú hamburguesa */}
      <button
        className="md:hidden fixed top-14 left-4 p-2 z-50"
        onClick={() => setMenuOpen(true)}
      >
        {
          menuOpen
            ? <FontAwesomeIcon icon={faBars} aria-hidden="true" style={{ display: 'none' }} />

            : <FontAwesomeIcon icon={faBars} aria-hidden="true" />

        }
      </button>

      <div className="flex flex-col items-start p-3">

        <div className="md:mb-[10px] md:pl-8 hidden md:block md:flex md:flex-col gap-3">
          <Menu onSave={handleSave} onOpen={handleOpen} />
          <div
            className="h-full w-full flex flex-wrap gap-7  mb-5"
          >

            <label htmlFor="brushSize">Brush Size: {brushSize} px</label>
            <input
              className="md:w-1/3"
              id="brushSize"
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
            />
            <button
              className={`rounded md:w-1/3 p-2 text-xl hover:scale-90 ${!isErasing ? "bg-lime-500" : "bg-gray-300"
                }`}
              onClick={() => { setIsErasing(false); setIsTextMode(false) }}
            >
              <FontAwesomeIcon icon={faPaintBrush} aria-hidden="true" />
            </button>
            <button
              className={`rounded md:w-1/3 p-2 text-xl hover:scale-90 ${isErasing ? "bg-lime-500" : "bg-gray-300"
                }`}
              onClick={() => { setIsErasing(true); setIsTextMode(false) }}
            >
              <FontAwesomeIcon icon={faEraser} aria-hidden="true" />
            </button>
            <input
              className="md:w-1/3 "
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)} // Actualiza el color del pincel
            />
            <button
              className={`rounded p-2 md:w-1/3 text-xl hover:scale-90 ${isTextMode ? "bg-lime-500" : "bg-gray-300"
                }`}
              onClick={() => {
                setIsTextMode(true);
                setIsErasing(false);
              }}
            >
              <FontAwesomeIcon icon={faFont} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>




      <canvas
        className=" border-solid border-[1px] 
        border-black bg-white md:w-[1000px] w-[340px] md:mr-7 ml-2 md:h-[500px] h-[520px]"
        id="paintCanvas"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onDoubleClick={isTextMode ? handleCanvasDoubleClick : null} // Maneja el doble clic para insertar texto
        onTouchStart={isTextMode ? null : startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}

      />
      {textInput.visible && (
        <input
          type="text"
          value={textInput.value}
          onChange={handleTextInputChange}
          onKeyDown={handleTextInputSubmit} // Dibuja el texto cuando se presiona Enter
          style={{
            position: "absolute",
            left: `${textInput.x}px`,
            top: `${textInput.y}px`,
            border: "1px solid black",
            backgroundColor: "white",
            padding: "2px",
            fontSize: `${brushSize * 2}px`,
            //ajustar la escala del canvas
            width: "auto",
            height: "auto",
          }}
          autoFocus
        />
      )}
    </div>
  );
};

export default Canvas;
