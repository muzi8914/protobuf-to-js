/**
 * 遍历目录下的.proto文件并分别编译为commonjs模块
 */

const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

const outPath = "./src/out/modules/";
const outFilePath = path.resolve(outPath);

const protoPath = "./src/modules/";
const filePath = path.resolve(protoPath);

const protoc = "./src/protoc/bin/protoc.exe";
const protocPath = path.resolve(protoc);


fs.readdir(filePath, function (err, files) {
    if (err) {
        console.error("读取proto目录失败", err);
        return;
    }
    const cmd = `${protocPath} --proto_path=${protoPath} --js_out=import_style=commonjs,binary:${outFilePath}/ ${protoPath}/*.proto`;
    exec(cmd, function (error, stdout, stderr) {
        if (error) {
            console.error("解析proto失败", error);
            return;
        }
        console.error("解析proto成功");
    });
});
