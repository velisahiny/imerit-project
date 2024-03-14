import React, {useCallback, useRef, useState} from "react";
import {Image as KanvaImage, Layer, Line, Rect, Stage} from "react-konva";
import {Button, Upload} from "antd";

export const DrawAction ={
    Scribble:"scribble"
}
const SIZE = 500;
function downloadURI(uri, name) {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export const ImageCanvas = React.memo(function Paint({propImage}) {
    const [color, setColor] = useState("#000");
    const [drawAction, setDrawAction] = useState(DrawAction.Scribble);
    const [image, setImage] = useState();
    const[scribbles,setScribbles]=useState([]);

    const fileRef = useRef(null);

    const stageRef = useRef(null);

    const isPaintRef = useRef(false);

    const onStageMouseUp = useCallback(() => {
        isPaintRef.current = false;
    }, []);

    const currentShapeRef = useRef();
    const handleExport =  () => {
        const dataURL = stageRef?.current.toDataURL({pixelRatio:3});
        downloadURI(dataURL,"drawn.png")
    };
    const onStageMouseDown = useCallback(
        (e) => {
            if (drawAction === DrawAction.Select) return;
            isPaintRef.current = true;
            const stage = stageRef?.current;
            const pos = stage?.getPointerPosition();
            const x = pos?.x || 0;
            const y = pos?.y || 0;
            const id = window.crypto.randomUUID();
            currentShapeRef.current = id;

            switch (drawAction) {
                case DrawAction.Scribble: {
                    setScribbles((prevScribbles) => [
                        ...prevScribbles,
                        {
                            id,
                            points: [x, y],
                            color,
                        },
                    ]);
                    break;
                }
            }
        },
        [drawAction, color]
    );

    const onStageMouseMove = useCallback(() => {
        if (drawAction === DrawAction.Select || !isPaintRef.current) return;

        const stage = stageRef?.current;
        const id = currentShapeRef.current;
        const pos = stage?.getPointerPosition();
        const x = pos?.x || 0;
        const y = pos?.y || 0;

        switch (drawAction) {
            case DrawAction.Scribble: {
                setScribbles((prevScribbles) =>
                    prevScribbles?.map((prevScribble) =>
                        prevScribble.id === id
                            ? {
                                ...prevScribble,
                                points: [...prevScribble.points, x, y],
                            }
                            : prevScribble
                    )
                );
                break;
            }


        }
    }, [drawAction]);
    const [cursorStyle, setCursorStyle]= useState("auto")
    const updateCursor=()=>{
        setCursorStyle("crosshair");
    }
    const revertCursor=()=>{
        setCursorStyle("auto");
    }
    const onImportImageClick = useCallback(() => {
        fileRef?.current && fileRef?.current?.click();
    }, []);
    const onImportImageSelect = useCallback(
        (e) => {
            if (e.target.files?.[0]) {
                const imageUrl = URL.createObjectURL(e.target.files?.[0]);
                const image = new Image(SIZE / 2, SIZE / 2);
                image.src = imageUrl;
                setImage(image);
            }
            e.target.files = null;
        },
        []
    );
    return (
        <div>
            <input
                type="file"
                ref={fileRef}
                onChange={onImportImageSelect}
                style={{display: "none"}}
                accept="image/*"
            />
            <Button
                icon={<Upload />}
                onClick={onImportImageClick}
            >
                Import Image
            </Button>
            <Button onClick={handleExport}>Export as PNG</Button>
            <Stage
                style={{
                    cursor: cursorStyle
                }}
                height={SIZE}
                width={SIZE}
                ref={stageRef}
                onMouseUp={onStageMouseUp}
                onMouseDown={onStageMouseDown}
                onMouseMove={onStageMouseMove}
                onMouseEnter={updateCursor}
                onMouseLeave={revertCursor}
            >
                <Layer>
                    <Rect
                        x={0}
                        y={0}
                        height={SIZE}
                        width={SIZE}
                        fill="white"
                        id="bg"
                    />
                    {image && (
                        <KanvaImage
                            image={image}
                            x={0}
                            y={0}
                            height={SIZE}
                            width={SIZE}
                        />
                    )}

                    {scribbles.map((scribble) => (
                        <Line
                            key={scribble.id}
                            id={scribble.id}
                            lineCap="round"
                            lineJoin="round"
                            stroke={scribble?.color}
                            strokeWidth={2}
                            points={scribble.points}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
});