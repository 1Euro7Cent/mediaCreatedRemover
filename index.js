const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const args = process.argv.slice(2)

const Config = require('./ServerConfig')

let serverConfig = new Config()
serverConfig.fromFile('./config.json')
serverConfig.save('./config.json')

let config = serverConfig.data
config.vidRegex = /.*\.(mkv|avi|mov|flv|wmv|webm|3gp|mpg|mpeg|vob|ogv|ogg|qt|asf|wma|wmv|flac|wav|mp3|aac|opus|flac|wma|wav|mp3|aac|opus|gif)$/i
config.imgRegex = /.*\.(bmp|webp|tiff|tif)$/i

/*
const ffmpegCommand = "-loglevel error -metadata:s creation_time= -c:v copy -c:a copy" // add source and destination file paths later in code
const overwrite = false // overwrite files if they already exist

const src = "./src" // source folder. the folder where the files are located. can be nested
const dest = "./dest" // destination folder. the folder where the files will be moved to. can be nested
const tmp = "./tmp" // temporary folder. the folder where the files will be moved to. can be nested
const putToTopLevel = true // all files found in sub folders will be moved to the top level folder

const vidRegex = /.*\.(mkv|avi|mov|flv|wmv|webm|3gp|mpg|mpeg|vob|ogv|ogg|qt|asf|wma|wmv|flac|wav|mp3|aac|opus|flac|wma|wav|mp3|aac|opus|gif)$/i
const changeVidToMp4 = true // change all video files to mp4 format
const imgRegex = /.*\.(|bmp|webp|tiff|tif)$/i
const changeImgToPng = true // change all image files to png format

//*/

function moveFiles(srcPath, deepness = 1) {

    createFolders()


    let files = fs.readdirSync(srcPath, { withFileTypes: true })
    for (let file of files) {
        let fileSrcPath = path.join(srcPath, file.name)
        // let stats = fs.statSync(fileSrcPath)

        if (file.isDirectory()) {
            // console.log("Entering folder: " + fileSrcPath)
            console.log(`${"   ".repeat(deepness)} Entering folder: ${fileSrcPath}`)

            moveFiles(fileSrcPath, deepness + 1)
        }
        else {
            let fileDestPath = path.join(config.dest, file.name)
            if (!config.putToTopLevel) {
                // remove the src path from the file path
                let srcPath_ = srcPath.replace(path.normalize(config.src), "")
                fileDestPath = path.join(config.dest, srcPath_, file.name)
            }

            // if dest path does not exist, create it
            if (!fs.existsSync(path.dirname(fileDestPath))) {
                fs.mkdirSync(path.dirname(fileDestPath), { recursive: true })
            }
            if (!config.renameExistingFiles && fs.existsSync(fileDestPath)) {
                console.log(`${"   ".repeat(deepness)}File exists: ${fileDestPath}. Skipping file...`)
                continue
            }

            let renameTry = 0
            while (fs.existsSync(fileDestPath)) {

                // console.log("   File exists: " + fileDestPath + ". Renaming file...")
                console.log(`${"   ".repeat(deepness)}File exists: ${fileDestPath}. Renaming file...`)

                renameTry++
                let ext = path.extname(fileDestPath)
                let base = path.basename(fileDestPath, ext)
                fileDestPath = path.join(path.dirname(fileDestPath), base + "_" + renameTry + ext)

            }
            let vidMatch = file.name.match(config.vidRegex)
            let imgMatch = file.name.match(config.imgRegex)
            // if (vidMatch) console.log(vidMatch)

            let fileChanged = false

            // if (file.name.endsWith(".mp4")) {
            if (vidMatch || imgMatch) {
                if (config.changeVidToMp4 || config.changeImgToPng) {
                    // console.log("   converting file to mp4: " + file.name)
                    let toMP4 = config.changeVidToMp4 && vidMatch
                    let toPNG = config.changeImgToPng && imgMatch
                    if (toMP4 && toPNG) throw new Error("Both toMP4 and toPNG are true. This should not happen")
                    let fileExtension = toMP4 ? ".mp4" : toPNG ? ".png" : ""
                    console.log(`${"   ".repeat(deepness)}converting file to ${fileExtension}: ${file.name}`)

                    let ext = path.extname(fileDestPath)
                    let base = path.basename(fileDestPath, ext)

                    let srcBase = path.basename(fileSrcPath, ext)

                    // execSync(`ffmpeg -i "${fileSrcPath}" "${fileDestPath}"`)

                    fileDestPath = path.join(path.dirname(fileDestPath), base + fileExtension)

                    // execSync(`ffmpeg${overwrite ? " -y" : ""} -i "${fileSrcPath}" "${path.join(path.dirname(fileDestPath), srcBase + ".mp4")}`)
                    //first convert to mp4 to tmp folder
                    let tmpDest = path.join(config.tmp, srcBase + fileExtension)
                    execSync(`ffmpeg${config.overwrite ? " -y" : ""} -i "${fileSrcPath}" -loglevel error "${tmpDest}`)
                    fileSrcPath = tmpDest
                    fileChanged = true
                }

            }



            if (!file.name.endsWith(".mp4") && !fileChanged) {
                // console.log("   copying file: " + file.name + " via fs.copyFileSync")
                console.log(`${"   ".repeat(deepness)}copying file: ${file.name} via fs.copyFileSync`)
                fs.copyFileSync(fileSrcPath, fileDestPath, config.overwrite ? fs.constants.COPYFILE_FICLONE : fs.constants.COPYFILE_EXCL)
            }
            else {
                // console.log("   copying file: " + file.name + "via ffmpeg")
                console.log(`${"   ".repeat(deepness)}copying file: ${fileSrcPath} via ffmpeg`)
                // fs.renameSync(fileSrcPath, fileDestPath)
                // execSync("ffmpeg -i " + fileSrcPath + " " + ffmpegCommand + " " + fileDestPath)
                execSync(`ffmpeg${config.overwrite ? " -y" : ""} -i "${fileSrcPath}" ${config.ffmpegCommand} "${fileDestPath}"`)
            }
        }


    }

}

function createFolders() {
    if (!fs.existsSync(config.src)) {
        console.error("Source path does not exist. creating: " + config.src)
        fs.mkdirSync(config.src, { recursive: true })
    }
    if (!fs.existsSync(config.dest)) {
        console.error("Destination path does not exist. creating: " + config.dest)
        fs.mkdirSync(config.dest, { recursive: true })
    }
    if (!fs.existsSync(config.tmp)) {
        console.error("Temporary path does not exist. creating: " + config.tmp)
        fs.mkdirSync(config.tmp, { recursive: true })
    }
}

function clearFolders() {
    console.log("Clearing tmp and dest folders", config.tmp, config.dest)
    if (fs.existsSync(config.dest)) fs.rmSync(config.dest, { recursive: true })
    if (fs.existsSync(config.tmp)) fs.rmSync(config.tmp, { recursive: true })
}


if (args.length <= 0) {
    if (config.clearSrcAndDest) clearFolders()

    moveFiles(config.src)
}
else {
    if (args.includes("clear")) {
        clearFolders()
        console.log("clearing src folder")
        if (fs.existsSync(config.src)) fs.rmSync(config.src, { recursive: true })
        console.log("recreating folders")
        createFolders()
    }
}
