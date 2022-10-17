#### 项目结构

```
├── src                  // 项目主要代码
│   ├── mudules          // 存放 proto 源文件, 即需要转译的文件
│   ├── protoc           // proto 文件转译工具, 具体版本信息, 见[gitHub protoc 说明](https://github.com/protocolbuffers/protobuf)
│   ├── out              // 目标输出文件夹
│       ├── browser      // 做完浏览器兼容后打包输出的文件位置
│       ├── modules      // proto 文件转译的 js 文件输出位置
│       └── terser       // 压缩合并最终输出的产物
│   ├── compile_proto.js // 手动执行 proto 文件编译的入口文件
│   └── entry.js         // 自动化一键执行的入口文件
├── package.json         // 项目配置文件
└── readme.md            // 项目说明文件, 先仔细阅读此文件
```

<font color='red'>分步操作时, 需要手动在 package.json 中, 修改 `merge-proto` 中的文件名</font>

<font color='red'> /src/modules/protocol_base.proto 只是示例文件, 自行编译时需删除</font>

#### 编译 proto 文件为 js 文件

需要安装依赖:

google-protobuf // 核心依赖

browserify // 做浏览器兼容

terser // 压缩合并

```
protoc 的编译命令:

    protoc *.proto --js_out=import_style=commonjs,binary:./pb

说明:

　　*.proto      选中当前目录的所有后缀为 .proto 的文件(也可以具体的某一个文件)。如果没有进到 *.proto 文件所在的目录，也可以加上路径:../path1/*.proto 这种。但是如果proto之间有相互引用，就不要加路径了，引用会报错。
　　--js_out　　 编译目标为 js 文件
　　commonjs　　 编译出来的 js 文件，按照 commonjs 导入使用
　　binary:./proto-js　　编译的输出目录，就是个相对路径。例如一个点：binary:. 直接编译到当前目录。文件多的时候建一个文件夹(提前建好)来放比较安逸

参照[web前端 js环境 使用 protobuf google-protobuf protoc 编译 .proto 文件 jssdk 微信小程序支持 报错 解决办法](https://www.cnblogs.com/jiayouba/p/14302256.html)
```


##### 浏览器上使用 google_protobuf 进行数据处理

google.protobuf 工具, 将 .protot 文件转译为 .js 文件


操作命令如下:


分步操作:

编译 proto 文件为 js 文件:
`npm run compile-proto-common`

合并编译后的 js 文件, 输出为 outPut.js:
`npm run merge-proto`
> 输出文件名可修改, 在 package.json 的 node 命令中修改, 同 entry.js 中输出命令也需要修改


压缩合并后的 js 文件, 输出为 util.js:
`npm run compress-proto`
> 输出文件名可修改, 方式同上



自动化直达:

输出同样为 utils.js:
`npm run build-proto`
> 输出文件名可修改, 方式同上


##### 小程序中使用 proto 进行数据处理

网页使用的 google-protobuf 协议, 不能直接在小程序中使用, 主要原因是:

一般情况下, 通过正常途径得到的 protobuf 协议, 是将 goog 对象绑定在 window | document 对象的, 但是小程序并没有 window | document 对象

解决办法: 找到全局对象, `手动将 goog 对象绑定到全局对象`

代码层:

1. 格式化 合并编译后的 outPut.js

2. 找到 `require("google-protobuf")` 调用的地方

3. 添加全局对象 const app = getApp();

4. 修改代码
```
var global = function () {
    return (
        app || this || window || global || self || Function("return this")()
    );
}.call(null);
```

5. 在 global 后添加代码:  var proto = global.proto;

6. 再次执行压缩处理, 得到的就是一个处理过后的 js 文件



思考:

1. 当前这种处理, 和直接用 webpack 把转译过后的 js 压缩合并, 本质上有什么不一样

    - 没有什么不同, 只需要注意 浏览器的兼容 即可

2. merge-proto 命令是否可以不用手动把所有的文件名全部列出来, 一个命令就查找指定目录下的指定后缀的文件, 自动 merge, 自动输出

    - 是可以, 需要自己手动去写一个处理程序, 运行该命令的时自动执行程序, 而不再是直接使用当下的处理


其实最麻烦的不是压缩合并, 而是<font color='red'>proto 文件转译成 js 文件</font>, 目前搜索出来的资料, 几乎没有可以直接使用的, 都需要手动处理. 本项目恰好解决这个问题, 可以拿来就用

