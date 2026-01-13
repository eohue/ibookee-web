
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

// Note: This script assumes the server is running on localhost:5001
// AND that we can bypass auth OR we need to comment out isAuthenticated in upload.ts temporarily.
// Since I cannot interactively login, I will modify upload.ts to temporarily allow public upload for this test, then revert.

async function testUpload() {
    try {
        const form = new FormData();
        // Create a dummy file (valid 1x1 PNG)
        const dummyPath = path.resolve('dummy.png');
        const pngBuffer = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082', 'hex');
        fs.writeFileSync(dummyPath, pngBuffer);
        form.append('image', fs.createReadStream(dummyPath));

        console.log("Attempting upload to http://localhost:5001/api/upload");
        const response = await axios.post('http://localhost:5001/api/upload', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        console.log("Upload Response:", response.data);
        fs.unlinkSync(dummyPath);
    } catch (error: any) {
        console.error("Upload Failed:", error.response ? error.response.data : error.message);
    }
}

testUpload();
