import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // i have use public/temp folder in ' ' and showing error be careful 
    cb(null, "public/temp")
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
    storage,
})
