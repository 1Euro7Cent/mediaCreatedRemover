const Config = require('mrconfig.js')
module.exports = class ServerConfig extends Config {
    constructor() {
        super("serverConfig", true)
        this.data = {
            ffmpegCommand: "-loglevel error -metadata:s creation_time= -c:v copy -c:a copy", // add source and destination file paths later in code
            overwrite: false, // overwrite files if they already exist
            src: "./src", // source folder. the folder where the files are located. can be nested
            dest: "./dest", // destination folder. the folder where the files will be moved to. can be nested
            tmp: "./tmp", // temporary folder. the folder where the files will be converted to. for example, webp to png, gif to mp4, etc
            putToTopLevel: true, // all files found in sub folders will be moved to the top level folder. if false, the same structure in the src folder will be in the dest folder
            //vidRegex: /.*\.(mkv|avi|mov|flv|wmv|webm|3gp|mpg|mpeg|vob|ogv|ogg|qt|asf|wma|wmv|flac|wav|mp3|aac|opus|flac|wma|wav|mp3|aac|opus|gif)$/i,
            changeVidToMp4: true, // change all video files to mp4 format
            //imgRegex: /.*\.(|bmp|webp|tiff|tif)$/i,
            changeImgToPng: true, // change all image files to png format
            renameExistingFiles: true, // rename files if they already exist
            clearSrcAndDest: false, // clear the src and dest folders before moving files

        }
    }

}