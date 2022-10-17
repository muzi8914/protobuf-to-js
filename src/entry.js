/**
 * 通过本脚本可以直接将proto文件转变为浏览器可用的js文件, 且无需引入第三方, 后续协议变更只需更新proto文件即可
 * 编译构建时会自动转换遍历目录下的.proto文件并分别编译为commonjs模块
 * google-protobuf当把proto转换为commonjs模块时是一对一的, 即一个proto文件对应一个js文件,不能直接合并为一个文件
 * 且在浏览器中存在兼容风险, 此时借助browserify对生成的多个js文件进行预编译并合并为一个文件
 * 最后借助terser进行压缩, 将压缩后的js文件输出到sdk指定目录(如common/libs)
 * 各阶段输出目录如下:
 *    proto转js: ./out/xxx_pb.js
 *    预编译并合并: ./browser/xxx.js
 *    压缩: src/common/libs/xxx.js (测试环节先输出至 src/test/utils.js)
 */

const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const browserify = require("browserify");
const { minify } = require("terser");

// protoc编译器所在目录
const protoc = "./src/protoc/bin/protoc.exe";
const protocPath = path.resolve(protoc);

// proto源文件目录
const protoPath = "./src/modules/";

// proto转js后输出目录
const pbjsPath = "./src/out/modules/";
const pbjsFilePath = path.resolve(pbjsPath);

// js预编译合并后输出目录
const browserifyPath = "./src/out/browser/outPut.js";
const browserifyFilePath = path.resolve(browserifyPath);

// 最终输出目录
const outPath = "./src/out/terser/util.js";
const outFilePath = path.resolve(outPath);

const execCmd = (cmdStr) => {
    return new Promise((resolve, reject) => {
        exec(cmdStr, function (error, stdout, stderr) {
            if (error) {
                console.error("执行" + cmdStr + "失败", { error, stderr });
                reject(error);
                return;
            }
            console.log("执行" + cmdStr + "成功");
            resolve(true);
        });
    });
};

const getFiles = (dir) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function (err, files) {
            if (err) {
                console.error("读取" + dir + "失败", err);
                reject(err);
            }
            resolve(files.map((fileName) => path.join(dir, fileName)));
        });
    });
};

const browserifyFile = (pbFiles) => {
    return new Promise((resolve, reject) => {
        const b = browserify().add(pbFiles);
        if (b) {
            b.bundle().pipe(fs.createWriteStream(browserifyFilePath)).on('close', function() {;
                resolve(true);
            })
        } else {
            reject(false);
        }
    });
};

const main = async () => {
    const cmd_p2j = `${protocPath} --proto_path=${protoPath} --js_out=import_style=commonjs,binary:${pbjsPath} ${protoPath}/*.proto`;
    try {
        const res_p2j = await execCmd(cmd_p2j);
        if (res_p2j) {
            const pbFiles = await getFiles(pbjsFilePath);
            const res_browser = await browserifyFile(pbFiles);
            if (res_browser) {
                const browserifiedFile = fs.readFileSync(browserifyFilePath, "utf8");
                const compressedStream = await minify(browserifiedFile);
                fs.writeFileSync(outFilePath, compressedStream.code, "utf8");
            }
        }
    } catch (error) {
        console.error("proto编译失败", error);
    }
};

main();
