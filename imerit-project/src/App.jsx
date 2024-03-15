import {useState} from 'react'
import './App.css'
import {ImageCanvas} from "./ImageCanvas.jsx";
import {ZipUploader} from "./ZipUploader.jsx";

const imagePath = "https://konvajs.org/assets/lion.png";

function App() {
    const [pngDataUrl, setPngDataUrl] = useState('');

    return (
        <>
            {pngDataUrl ? <ImageCanvas imageURL={pngDataUrl}/> :
                <ZipUploader setPngDataUrl={setPngDataUrl}/>
            }
        </>
    )
}

export default App
