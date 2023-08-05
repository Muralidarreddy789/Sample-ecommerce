const fs=require('fs');

const deleteFile=(imagepath)=>{

    fs.unlink(imagepath,(err)=>{
        if(err)
        {
            throw (err);
        }
    });
}

module.exports=deleteFile;