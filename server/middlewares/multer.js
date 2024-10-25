import multer from "multer"

//Creating multer middleware for parsing formData
const storage=multer.diskStorage({
    filename:function(re,file,callback){
        callback(null,`${Date.now()}_${file.originalname}`)
    }
})

const upload=multer({storage})
export default upload;