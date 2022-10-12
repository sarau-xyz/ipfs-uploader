import formidable from "formidable";
import fs from "fs";
import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false
  }
};

const post = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    await saveFile(files.file);
    sendIpfs(`./public/${files.file.originalFilename}`)
    return res.status(201).send("");
  });
};

const saveFile = async (file) => {
  const data = fs.readFileSync(file.filepath);
  fs.writeFileSync(`./public/${file.originalFilename}`, data);
  await fs.unlinkSync(file.filepath);
  return;
};


const sendIpfs = async (file) => {
    var data = new FormData();
    data.append('file', fs.createReadStream(file)) ;
    data.append('pinataOptions', '{"cidVersion": 1}');
    data.append('pinataMetadata', '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}');

    var config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        headers: { 
            authorization: "Bearer "+process.env.REACT_APP_PINATA_JWT,
            ...data.getHeaders()
        },
        data : data
        };

    const res = await axios(config);

    console.log(res.data);

}

export default (req, res) => {
  req.method === "POST"
    ? post(req, res)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? console.log("DELETE")
    : req.method === "GET"
    ? console.log("GET")
    : res.status(404).send("");
};
