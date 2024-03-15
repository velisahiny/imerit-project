import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Image as KanvaImage, Layer, Line, Rect, Stage} from "react-konva";
import {Button, Col, ColorPicker, Flex, Radio, Row} from "antd";
import JSZip from "jszip";
import PropTypes from "prop-types";

export const DrawAction = {
    Pen: "Pen",
    Brush: "Brush"
}
const options = [
    {label: DrawAction.Pen, value: DrawAction.Pen},
    {label: DrawAction.Brush, value: DrawAction.Brush}
];
const strokeWidths = {
    [DrawAction.Pen]: 4,
    [DrawAction.Brush]: 8
}
const SIZE = 500;


function downloadZip(dataURL, name) {
    // Create a new zip file
    const zip = new JSZip();

    // Add the exported image to the zip file
    zip.file(`${name}.png`, dataURL.substr(dataURL.indexOf(',') + 1), {base64: true});

    // Generate the zip content
    zip.generateAsync({type: 'blob'}).then(content => {
        // Create a temporary link element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${name}.zip`;
        link.click();
    });
}


export function ImageCanvas({imageURL}) {
    const [color, setColor] = useState("#00000");
    const [drawAction, setDrawAction] = useState(DrawAction.Pen);
    const [lines, setLines] = useState([]);
    const image = useMemo(() => {
        const imageElement = new Image(SIZE / 2, SIZE / 2);
        imageElement.src = imageURL;
        return imageElement;
    }, [imageURL]);
    const containerRef = useRef(null);
    const [stageSize, setStageSize] = useState({
        width: SIZE,
        height: SIZE
    });

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const {width, height} = containerRef.current.getBoundingClientRect();
                setStageSize({width, height});
            }
        };

        handleResize(); // Call it initially
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const stageRef = useRef(null);

    const isPaintRef = useRef(false);

    const onStageMouseUp = useCallback(() => {
        isPaintRef.current = false;
    }, []);

    const currentShapeRef = useRef();
    const handleExport = () => {
        const dataURL = stageRef?.current.toDataURL({pixelRatio: 3});
        downloadZip(dataURL, "drawn");
    };
    const handleExportMask = () => {
        const clonedStage = stageRef.current.getStage().clone();
        clonedStage.find(".exclude").forEach(node => node.destroy());
        const dataURL = clonedStage.toDataURL({pixelRatio: 3});
        downloadZip(dataURL, "mask")
    }


    const onStageMouseDown = useCallback(
        (e) => {
            if (![DrawAction.Pen, DrawAction.Brush].includes(drawAction)) return;
            isPaintRef.current = true;
            const stage = stageRef?.current;
            const pos = stage?.getPointerPosition();
            const x = pos?.x || 0;
            const y = pos?.y || 0;
            const id = window.crypto.randomUUID();
            currentShapeRef.current = id;

            switch (drawAction) {
                case DrawAction.Brush:
                case DrawAction.Pen: {

                    setLines((prevLines) => [
                        ...prevLines,
                        {
                            id,
                            points: [x, y],
                            color,
                            strokeWidth: strokeWidths[drawAction]
                        },
                    ]);
                    break;
                }
                default :
                    return;
            }
        },
        [drawAction, color]
    );
    const onStageMouseMove = useCallback(() => {
        if (![DrawAction.Pen, DrawAction.Brush].includes(drawAction) || !isPaintRef.current) return;
        const stage = stageRef?.current;
        const id = currentShapeRef.current;
        const pos = stage?.getPointerPosition();
        const x = pos?.x || 0;
        const y = pos?.y || 0;

        switch (drawAction) {
            case DrawAction.Brush:
            case DrawAction.Pen: {
                setLines((prevLines) =>
                    prevLines?.map((prevLine) =>
                        prevLine.id === id
                            ? {
                                ...prevLine,
                                points: [...prevLine.points, x, y],
                            }
                            : prevLine
                    )
                );
                break;
            }
        }
    }, [drawAction]);
    const [cursorStyle, setCursorStyle] = useState("auto")
    const updateCursor = () => {
        setCursorStyle("crosshair");
    }
    const revertCursor = () => {
        setCursorStyle("auto");
    }
    const onDrawingTypeChange = (e) => {
        setDrawAction(e.target.value);
    }


    return (
        <div>
            <Row>
                <Col flex={1}>
                    <Flex vertical>
                        <ColorPicker showText value={color} onChange={(value, hex) => setColor(hex)}/>
                        <Radio.Group onChange={onDrawingTypeChange} optionType="button" buttonStyle="solid"
                                     options={options}/>
                        <Button onClick={handleExport}>Export</Button>
                        <Button onClick={handleExportMask}>Export Mask File</Button>
                    </Flex>
                </Col>
                <Col flex={6}>
                    <div ref={containerRef} style={{background: "white", width: '100%', height: '100%'}}>
                        <Stage
                            style={{
                                cursor: cursorStyle
                            }}
                            height={stageSize.height}
                            width={stageSize.width}
                            ref={stageRef}
                            onMouseUp={onStageMouseUp}
                            onTouchEnd={onStageMouseUp}
                            onMouseDown={onStageMouseDown}
                            onTouchStart={onStageMouseDown}
                            onTouchMove={onStageMouseMove}
                            onMouseMove={onStageMouseMove}
                            onMouseEnter={updateCursor}
                            onMouseLeave={revertCursor}
                        >
                            <Layer>
                                <Rect
                                    x={0}
                                    y={0}
                                    height={stageSize.height}
                                    width={stageSize.width}
                                    id="bg"
                                />
                                {image && (
                                    <KanvaImage
                                        name="exclude"
                                        image={image}
                                        x={0}
                                        y={0}
                                        height={stageSize.height}
                                        width={stageSize.width}
                                    />
                                )}
                                {lines.map((line) => (
                                    <Line
                                        key={line.id}
                                        id={line.id}
                                        lineCap="round"
                                        lineJoin="round"
                                        stroke={line?.color}
                                        strokeWidth={line.strokeWidth}
                                        points={line.points}
                                    />
                                ))}
                            </Layer>
                        </Stage>
                    </div>

                </Col>
            </Row>

        </div>
    );
}

ImageCanvas.propTypes = {
    imageURL: PropTypes.string
}