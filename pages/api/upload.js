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
    const resIpfs = await sendIpfs(files.file.filepath)


    const resJson = await sendJson(
      {      
        name: files.file.originalFilename,
        image: "ipfs://"+resIpfs.IpfsHash

    })

    const resp = {
      name: files.file.originalFilename,
      image: "ipfs://"+resJson.IpfsHash
    }

    
    return res.status(201).send(resp);
  });
};



const sendIpfs = async (file) => {
    const data = new FormData();
    data.append('file', fs.createReadStream(file)) ;
    data.append('pinataOptions', '{"cidVersion": 1}');
    data.append('pinataMetadata', '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}');

    const config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        headers: { 
            authorization: "Bearer "+process.env.REACT_APP_PINATA_JWT,
            ...data.getHeaders()
        },
        data : data
        };

    const res = await axios(config);

    console.log(res.data)
    return res.data
    ;

}

const sendJson = async (data) => {
  const dataJson = data;
  
  const config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
      'Content-Type': 'application/json', 
      authorization: "Bearer "+process.env.REACT_APP_PINATA_JWT
    },
    data : dataJson
  };
  
  const res = await axios(config);
  
  console.log(res.data);
  return res.data
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
