import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ImageCanvas} from "./ImageCanvas.jsx";
import {ImageForm} from "./ImageForm.jsx";
import useImage from 'use-image';
const imagePath= "https://konvajs.org/assets/lion.png";
function App() {
    const [image]= useImage(imagePath);

    return (
    <div>
        {image? <ImageCanvas propImage={image}></ImageCanvas>:null}
        <ImageForm></ImageForm>
    </div>
  )
}

export default App
