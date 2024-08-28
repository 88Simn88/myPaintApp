import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const Menu = ({ onSave, onOpen }) => {


    return (
        <div className=" h-full w-4/5 flex  gap-3 p-2
        ">
            <button
                className="border-solid w-1/3 ml-2 md:m-0 border-2 border-black 
            rounded hover:scale-90"
                onClick={onSave}
            ><FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" /></button>

            {/* <!-- Ocultar el input de tipo file -->*/}
            <input
                type="file"
                accept="image/*"
                id="fileInput"
                class="hidden"
                onChange={onOpen}
            />

            {/* //<!-- Botón personalizado --> */}
            <label for="fileInput"
                class="inline-block  border-solid text-center w-1/3 ml-2 md:m-0 border-2 border-black 
            rounded hover:scale-90">
                <FontAwesomeIcon icon={faFolderOpen} aria-hidden="true" />

            </label>



        </div>
    )
}

export default Menu