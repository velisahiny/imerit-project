import React, {useState} from 'react';
import {InboxOutlined} from '@ant-design/icons';
import {message, Upload} from 'antd';
import JSZip from "jszip";

const {Dragger} = Upload;
const props = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    beforeUpload(file) {
        const isZip = ['application/zip', "application/x-zip-compressed"].includes(file.type);
        if (!isZip) {
            message.error('You can only upload ZIP files!');
        }
        return isZip;
    },
    onChange(info) {
        const {status} = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
    // action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    accept: ".zip",

    onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
    },
};

export function ZipUploader({setPngDataUrl}) {
    const [errorMessage, setErrorMessage] = useState('');
    const acceptFile = async (zipFile) => {
        if (!zipFile) {
            setErrorMessage('Please upload a ZIP file.');
            return;
        }
        const zip = new JSZip();

        // Load the zip file
        zip.load
        const zipData = await zip.loadAsync(zipFile);

        // Assume you have a PNG file inside the zip with the name 'image.png'

        const [key, pngFile] = Object.entries(zipData.files)[0];

        if (pngFile) {
            // Read the PNG file as a data URL
            const base64 = await pngFile.async('base64');

            // Convert array buffer to base64


            // Create data URL
            const dataUrl = `data:image/png;base64,${base64}`;
            setPngDataUrl(dataUrl);
            return JSON.stringify({
                "success": true
            })
        } else {
            console.error('No PNG file found in the zip.');
        }

    };

    const customRequest = async ({file, onSuccess, onError}) => {
        try {
            const pngFiles = await acceptFile(file);
            if (pngFiles.length === 0) {
                message.error('No PNG files found inside the ZIP file!');
                onError();
            } else {
                message.success('PNG files extracted successfully');
                onSuccess('ok');
            }
        } catch (error) {
            console.error('Error processing file:', error);
            message.error('Error processing file');
            onError();
        }
    };
    return (
        <Dragger {...props} customRequest={customRequest}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined/>
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
                Only zip files are accepted.
            </p>
        </Dragger>
    );
}

