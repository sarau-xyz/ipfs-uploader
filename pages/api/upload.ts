import formidable from "formidable";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

const post = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    console.log("fields=", fields);
    console.log("files=", files);
    const resIpfs = await sendIpfs((files.file as formidable.File));

    const resJson = await sendJson({
      name: fields.name,
      image: "ipfs://" + resIpfs.IpfsHash,
    });

    const resp = {
      name: fields.name,
      image: "ipfs://" + resJson.IpfsHash,
    };
    console.log(resp);
    return res.status(201).send(resp);
  });
};

const sendIpfs = async (file: formidable.File) => {
  const data = new FormData();
  data.append("file", fs.readFileSync(file.filepath));
  data.append("pinataOptions", '{"cidVersion": 1}');
  data.append(
    "pinataMetadata",
    '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}'
  );

  const config = {
    method: "post",
    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    headers: {
      authorization: "Bearer " + process.env.REACT_APP_PINATA_JWT,
      ...data.getHeaders(),
    },
    data: data,
  };

  const res = await axios(config);

  console.log(res.data);
  return res.data;
};

const sendJson = async (data) => {
  const dataJson = data;

  const config = {
    method: "post",
    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    headers: {
      "Content-Type": "application/json",
      authorization: "Bearer " + process.env.REACT_APP_PINATA_JWT,
    },
    data: dataJson,
  };

  const res = await axios(config);

  console.log(res.data);
  return res.data;
};

export default (req, res) => {
  if (req.method === "POST") {
    post(req, res);
  } else if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST");
    res.status(200).send("OK");
  } else {
    res.status(404).send();
  }
};
