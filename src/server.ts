import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";
import { Request, Response, NextFunction } from "express";
// const validUrl = require('valid-url');
import jwt from "jsonwebtoken";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 5000;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  //auth
  const requireAuth = (req: Request, res: Response, next: NextFunction) =>{
    
    if (!req.headers || !req.headers.authorization){
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    
    const token = req.headers.authorization
    return jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        return res.status(500).send({ message: 'Failed to authenticate.' });
      }
      return next();
    });
}


  app.get("/filteredimage",requireAuth,async (req: Request, res: Response) => {
    let img:string = req.query.image_url;
    if (!img) {return res.send("You must add an image_URL")};
    
    // if (!validUrl.isUri(img)){return res.send("You must add a valid image_URL")};

    let filtered_img:string;
    filtered_img = await filterImageFromURL(img);
    
    res.sendFile(filtered_img, function (err) {
      if (err) {
        res.send("error in sending your file")
      } else {
        console.log('Sent:', filtered_img)
        deleteLocalFiles([filtered_img])
      }
    })
  });

  var token;
  app.get("/get-access/:name", async (req: Request, res: Response) => {
    let name:string =  req.params.name;
    if (!name) {return res.send("you must provide a name (/get-access/your-name)")};

    token = jwt.sign({name}, 'secret');
    res.json({
      token,
      message:"use this token to filter your image!"
    })

  });

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  app.get("/*", (req: Request, res: Response) => {
    res.status(404).send("Not found");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
import { fromNode } from "bluebird";
