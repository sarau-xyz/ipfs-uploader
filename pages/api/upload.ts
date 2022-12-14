import formidable from "formidable";
import fs from "fs";
import pinataSDK from "@pinata/sdk";

export const config = {
  api: {
    bodyParser: false
  }
};


const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

const post = async (req, res) => {
  const form = new formidable.IncomingForm({
    maxFiles: 1,
    maxFields: 2,
    allowEmptyFiles: false,
  });

  form.parse(req, async function (err, fields, files) {
    const hashImage = await sendIpfs(files.file as formidable.File);

    const hashJson = await sendJson({
      name: fields.name,
      image: "ipfs://" + hashImage,
    });

    return res.status(201).send({
      name: fields.name,
      image: "ipfs://" + hashJson,
    });
  });
};

const sendIpfs = async (file: formidable.File): Promise<string> => {
  const res = await pinata.pinFileToIPFS(fs.createReadStream(file.filepath));
  return res.IpfsHash;
};

const sendJson = async (data: Object): Promise<string> => {
  const res = await pinata.pinJSONToIPFS(data);
  return res.IpfsHash;
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
