"use strict";
//管理所有wasm模組相關物件
class WebWasm {
    constructor() {
        //初始化 物件成員變數
        this.initObjectVar();
    }
    //物件屬性:
    static initStaticVar() {
        //console.log("WebWasm.initStaticVar()");
        //return;
        //模組載入起始時間
        WebWasm.startTime = new Date().getTime();
        //建立設定加入 所有 副模組 wasm:
        //(ex: url="./js/wasm/MapDataEarth.wasm")
        WebWasm.allWasmFileNames.push("./js/wasm/MapboxModule.wasm"); //[1]
        WebWasm.allWasmFileNames.push("./js/wasm/RayModule.wasm"); //[2]
        //取得設定模組總數(主模組+副模組):
        WebWasm.allWasmCount = WebWasm.allWasmFileNames.length + 1;
        //載入並建立所有模組物件:
        //WebWasm.allWasmModuleObjs = new Array(WebWasm.allWasmCount);
        WebWasm.allWasmModuleObjs = new Array();
        //1.主 模組 物件:
        //載入並建立 主 模組 物件:
        //@ts-ignore
        let mainModule = new Module({}); //ok,載入建立wasm主模組功能物件(為mainWasm.js物件);載入完成會觸發 onRuntimeInitialized事件
        //新增模組之相關自訂屬性:
        //let timeStamp: number = new Date().getTime();
        //mainModule.onRuntimeInitialized = WebWasm.wasmLoadComplete;//設定該wasm載入完成,且可用時之對應執行函式
        mainModule.fileURL = "mainWasm"; //僅供識別用,不會觸發 onRuntimeInitialized事件
        mainModule.memory = mainModule._getMemory();
        mainModule.buffer = mainModule._getBuffer();
        //mainModule.onRuntimeInitialized = WebWasm.wasmLoadComplete;//ok
        mainModule.onRuntimeInitialized = () => {
            WebWasm.wasmLoadComplete(mainModule);
        }; //具參數傳遞
        WebWasm.allWasmModuleObjs.push(mainModule); //主模組;[0]
        //2.載入並建立所有 副 模組 物件:
        for (let i = 0; i < WebWasm.allWasmFileNames.length; i++)
            WebWasm.createModule(WebWasm.allWasmFileNames[i]);
        //設定 所有 wasm 模組 對應 物件
        WebWasm.MainWasm = WebWasm.allWasmModuleObjs[0];
        WebWasm.MapboxModule = WebWasm.allWasmModuleObjs[1];
        WebWasm.RayModule = WebWasm.allWasmModuleObjs[2];
    }
    //建立所有 副模組 物件:
    static createModule(url) {
        //@ts-ignore
        let subModule = new Module({ dynamicLibraries: [url] }); //建立副模組物件,載入完成會觸發 onRuntimeInitialized事件
        //新增模組之相關自訂屬性:
        //subModule.onRuntimeInitialized = WebWasm.wasmLoadComplete;//設定該wasm載入完成,且可用時之對應執行函式
        subModule.fileURL = url;
        subModule.memory = subModule._getMemory();
        subModule.buffer = subModule._getBuffer();
        //subModule.onRuntimeInitialized = WebWasm.wasmLoadComplete;//ok
        subModule.onRuntimeInitialized = () => {
            WebWasm.wasmLoadComplete(subModule);
        }; //具參數傳遞
        WebWasm.allWasmModuleObjs.push(subModule);
        return subModule;
    }
    /**模組載入完成之對應執行函式*/
    static wasmLoadComplete(module) {
        WebWasm.currentWasmCount = WebWasm.currentWasmCount + 1;
        //模組 功能 測試
        //WebWasm.test_Modules(module);
        //初始 設定 wasm 模組 元件 (啟用 wasm 元件)
        WebWasm.init_Modules(module);
        if (WebWasm.currentWasmCount == WebWasm.allWasmCount) {
            WebWasm.isLoadComplete = true; //所有模組載入完成
            //計算載入所有模組所需時間:
            let t = new Date().getTime();
            WebWasm.loadTime = (t - WebWasm.startTime) / 1000;
            //console.log("模組總數=" + WebWasm.allWasmCount+"\n 載入所有wasm模組所需時間= " + WebWasm.loadTime + "秒 ");
            ////模組 物件 功能函式測試:
            //WebWasm.testWasmModuleFun();
            //所有wasm模組全部載入完成,再執行winOnLoad(),
            WinOnLoad.winOnLoad();
            console.log("wasm load complete: =" + WebWasm.currentWasmCount);
        }
        //console.log("WebWasm.currentWasmCount=" + WebWasm.currentWasmCount + " ; Module.fileURL=" + this.fileURL);
    }
    /**初始 設定 wasm 模組 元件 (啟用 wasm 元件)*/
    static init_Modules(module) {
        let k = 1;
        //console.log("WebWasm.init_Modules() : fileURL= " + module.fileURL + " ; currentWasmCount=" + WebWasm.currentWasmCount);
        //設定 模組元件 on:
        let is_mainWasm = false;
        let url = module.fileURL;
        if (url == "mainWasm")
            is_mainWasm = true;
        else
            is_mainWasm = false;
        //#region test before :
        /*
        //test before:-------------------------------------------------------
        let n1, nn1;
        let strTemp;
        if (is_mainWasm)
            n1 = module.ccall('sub', 'number', ['number', 'number'], [5, 3]);
        else
        {
            n1 = module.ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);

            if (module.fileURL == "./js/wasm/MapboxModule.wasm")
            {
                strTemp = module.ccall('get_accessToken', 'string', [], []);

            }

            if (WebWasm.currentWasmCount >= 3)
                nn1 = WebWasm.allWasmModuleObjs[1].ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);
        }
        //------------------------------------------------------------------
        */
        //#endregion
        //取得 設定建立 wasm元件 之 資料驗證物件 (userData):
        //f:void set_UserData()
        if (is_mainWasm)
            module.ccall('set_UserData', 'void', [], []);
        else {
            module.ccall('set_UserData_SM', 'void', [], []);
        }
        //#region test after:
        /*
        //test after:-------------------------------------------------------
        if (is_mainWasm)
            n1 = module.ccall('sub', 'number', ['number', 'number'], [5, 3]);
        else
        {
            n1 = module.ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);

            if (module.fileURL == "./js/wasm/MapboxModule.wasm")
            {
                strTemp = module.ccall('get_accessToken', 'string', [], []);

            }


            if (WebWasm.currentWasmCount >= 3)
                nn1 = WebWasm.allWasmModuleObjs[1].ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);
        }
        //--------------------------------------------------------------
        */
        //#endregion
    }
    /**測試 所有 wasm 模組 元件 */
    static test_Modules(module) {
        let k = 1;
        let is_mainWasm = false;
        let url = module.fileURL;
        if (url == "mainWasm")
            is_mainWasm = true;
        else
            is_mainWasm = false;
        //所有模組 執行 元件 驗證-->是否 啟用 模組 所有功能函式:
        //元件驗證 前:
        let message;
        let name;
        let strTemp;
        let enks0;
        let enks1;
        let enks2;
        if (is_mainWasm) {
            name = module.ccall('get_userData_name', 'string', [], []);
            strTemp = module.ccall('get_userData_enablekeys', 'string', [], []);
            enks0 = strTemp.split(",");
        }
        else {
            name = module.ccall('get_userData_name_SM', 'string', [], []);
            strTemp = module.ccall('get_userData_enablekeys_SM', 'string', [], []);
            enks1 = strTemp.split(",");
            if (WebWasm.currentWasmCount >= 3) {
                name = WebWasm.allWasmModuleObjs[1].ccall('get_userData_name_SM', 'string', [], []);
                strTemp = WebWasm.allWasmModuleObjs[1].ccall('get_userData_enablekeys_SM', 'string', [], []);
                enks2 = strTemp.split(",");
            }
        }
        k = 1;
        //f:int sub(int a, int b)
        let n1;
        let nn1, nn2, nn3, nn4, nn5, nn6;
        let is_enable3;
        if (is_mainWasm)
            n1 = module.ccall('sub', 'number', ['number', 'number'], [5, 3]);
        else {
            n1 = module.ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);
            if (WebWasm.currentWasmCount >= 3)
                nn1 = WebWasm.allWasmModuleObjs[1].ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);
        }
        //f:bool getEnable()
        let is_enable;
        if (is_mainWasm)
            is_enable = module.ccall('getEnable', 'number', [], []); //0-->false;1-->true
        else {
            is_enable = module.ccall('getEnable_SM', 'number', [], []);
            if (WebWasm.currentWasmCount >= 3)
                is_enable3 = WebWasm.allWasmModuleObjs[1].ccall('getEnable_SM', 'number', [], []);
        }
        //f:const char* get_userData_key()
        let key, key11, key12;
        if (is_mainWasm)
            key = module.ccall('get_userData_key', 'string', [], []);
        else {
            key = module.ccall('get_userData_key_SM', 'string', [], []);
            if (WebWasm.currentWasmCount >= 3)
                key11 = WebWasm.allWasmModuleObjs[1].ccall('get_userData_key_SM', 'string', [], []);
        }
        //取得 設定建立 wasm元件 之 資料驗證物件 (userData):
        //f:void set_UserData()
        if (is_mainWasm)
            module.ccall('set_UserData', 'void', [], []);
        else {
            module.ccall('set_UserData_SM', 'void', [], []);
        }
        //元件驗證 後:
        let name2, n2, n3, n4, n5, n6, n7, n8, n9;
        let name3;
        if (is_mainWasm) {
            name2 = module.ccall('get_userData_name', 'string', [], []);
            strTemp = module.ccall('get_userData_enablekeys', 'string', [], []);
            enks0 = strTemp.split(",");
        }
        else {
            name2 = module.ccall('get_userData_name_SM', 'string', [], []);
            strTemp = module.ccall('get_userData_enablekeys_SM', 'string', [], []);
            enks1 = strTemp.split(",");
            if (WebWasm.currentWasmCount >= 3) {
                name3 = WebWasm.allWasmModuleObjs[1].ccall('get_userData_name_SM', 'string', [], []);
                strTemp = WebWasm.allWasmModuleObjs[1].ccall('get_userData_enablekeys_SM', 'string', [], []);
                enks2 = strTemp.split(",");
            }
        }
        //f:int sub(int a, int b)
        if (is_mainWasm)
            n2 = module.ccall('sub', 'number', ['number', 'number'], [5, 3]);
        else {
            //let is_enable3: boolean = module.ccall('getEnable', 'number', [], []);//0-->false
            n3 = module.ccall('sub', 'number', ['number', 'number'], [5, 3]); //錯誤值,-1; 不可直接以副組物件呼叫執行主模組方法,會得到非預期結果值
            n4 = WebWasm.allWasmModuleObjs[0].ccall('sub', 'number', ['number', 'number'], [5, 3]); //102;正確;以主模組物件呼叫執行主模組方法
            if (WebWasm.currentWasmCount >= 3)
                n7 = WebWasm.allWasmModuleObjs[1].ccall('sub', 'number', ['number', 'number'], [5, 3]);
            n5 = module.ccall('add', 'number', ['number', 'number'], [5, 3]);
            n6 = module.ccall('add_SM', 'number', ['number', 'number'], [5, 3]);
            if (WebWasm.currentWasmCount >= 3)
                n8 = WebWasm.allWasmModuleObjs[1].ccall('add_SM', 'number', ['number', 'number'], [5, 3]);
            //return;
            is_enable = module.ccall('getEnable', 'number', [], []); //0-->false;1-->true
            is_enable = WebWasm.allWasmModuleObjs[0].ccall('getEnable', 'number', [], []); //0-->false;1-->true
            n2 = module.ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);
            if (WebWasm.currentWasmCount >= 3)
                n9 = WebWasm.allWasmModuleObjs[1].ccall('sub_SM', 'number', ['number', 'number'], [5, 3]);
        }
        //f:bool getEnable()
        let is_enable2;
        let is_enable33;
        if (is_mainWasm)
            is_enable2 = module.ccall('getEnable', 'number', [], []); //0-->false
        else {
            is_enable2 = module.ccall('getEnable_SM', 'number', [], []);
            if (WebWasm.currentWasmCount >= 3)
                is_enable33 = WebWasm.allWasmModuleObjs[1].ccall('getEnable_SM', 'number', [], []);
        }
        //f:const char* get_userData_key()
        let key2, key22;
        if (is_mainWasm)
            key2 = module.ccall('get_userData_key', 'string', [], []);
        else {
            key2 = module.ccall('get_userData_key_SM', 'string', [], []);
            if (WebWasm.currentWasmCount >= 3)
                key22 = WebWasm.allWasmModuleObjs[1].ccall('get_userData_key_SM', 'string', [], []);
        }
        //console.log("wasm url: " + url + " ; name= " + name2+" ; is_enable= " + is_enable2 + " ; key= " + key2);
        k = 1;
    }
    /**建立取得一個整數 指標 (供wasm傳址呼叫用)*/
    static createPointer_INT(wasmModule, initValue) {
        let rc = initValue;
        let intBytes = wasmModule.HEAP32.BYTES_PER_ELEMENT;
        let arrayPointer = wasmModule._malloc((1 * intBytes));
        wasmModule.HEAP32.set([rc], (arrayPointer / intBytes));
        return arrayPointer;
    }
    /**取得 整數 指標 所對應的 數值*/
    static getPointerValue_INT(wasmModule, arrayPointer) {
        let prValue;
        prValue = new Int32Array(wasmModule.buffer, arrayPointer, 1)[0];
        //wasmModule._free(arrayPointer);//該指標不可以被釋放,否則會err!!
        return prValue;
    }
    /** 由wasm指標(doluble陣列指標) 建立,取得 該指標所儲存之所有陣列成員值 */
    static getArrayFromPointer_Doubles(wasmModule, arrayPointer, size) {
        let retValues;
        let nums = new Array(size);
        retValues = new Float64Array(wasmModule.buffer, arrayPointer, size);
        for (let i = 0; i < size; i++)
            nums[i] = retValues[i];
        //wasmModule._free(arrayPointer);//該指標不可以被釋放,否則會err!!
        return nums;
    }
    /** 由wasm指標(int陣列指標) 建立,取得 該指標所儲存之所有陣列成員值 */
    static getArrayFromPointer_Ints(wasmModule, arrayPointer, size) {
        let retValues;
        let nums = new Array(size);
        retValues = new Int32Array(wasmModule.buffer, arrayPointer, size);
        for (let i = 0; i < size; i++)
            nums[i] = retValues[i];
        return nums;
    }
    /**模組 物件 功能函式測試:*/
    static testWasmModuleFun() {
        return;
        let k = 1;
        let wasmModule;
        let pr;
        ////wasm_WebglModule:
        //let pt = WebWasm.wasm_WebglModule.ccall('add', 'number', ['number', 'number'], [1, 2]);
        k = 1;
        ////VLayersDTMMaps.wasm:[11]
        //wasmModule = WebWasm.allWasmModuleObjs[11];
        //let url = wasmModule.fileURL;
        //let x = 1;
        //let pt = WebWasm.allWasmModuleObjs[3].ccall('get_Point', 'number', ['number', 'number', 'number'], [1.1, 2.2, 3.3]);
        //a.主模組 物件 功能函式測試: 
        //#region 
        /*
        let mainModule = WebWasm.allWasmModuleObjs[0];

        let message;
        //f:const char* getIP():
        //let ip = mainModule.ccall('getIP', 'string', [], []);//可取得 字串值,但無法釋放記憶體指標,不使用

        let ip = mainModule.ccall('getIP', 'number', [], []);
        message = mainModule.UTF8ToString(ip);  // 把 char* 轉成 JS 字串
        let byte = mainModule.HEAPU8[ip];  // 檢查該位置是否為空（或某個已知值）
        //記得釋放記憶體
        mainModule._free(ip);
        byte = mainModule.HEAPU8[ip];  // 檢查該位置是否為空（或某個已知值）
        message = mainModule.UTF8ToString(ip);  // 把 char* 指標 轉成 JS 字串

        //f:int addFunTest():
        let a = mainModule.ccall('addFunTest', 'number', [], []);

        //f:const char* getStrTest2()
        //let ss2 = mainModule.ccall('getStrTest2', 'string', [], []);//取得回傳 字串 值,無法釋放指標記憶體
        let sp = mainModule.ccall('getStrTest2', 'number', [], []);//取得回傳 字串 值
        message = mainModule.UTF8ToString(sp);  // 把 char* 指標 轉成 JS 字串
        //message = mainModule._getStr2();//ok
        //釋放記憶體
        mainModule._free(sp);
     
        //f:int sub(int a, int b)
        let n1 = mainModule.ccall('sub', 'number', ['number', 'number'], [5, 3]);

        //f:bool getEnable()
        let b1: boolean = mainModule.ccall('getEnable', 'number', [], []);//0-->false
       
        //f:const char* get_userData_key()
        let s3 = mainModule.ccall('get_userData_key', 'string', [], []);//ok;較簡潔
        //let s3 = mainModule.ccall('get_userData_key', 'number', [], []);
        message = mainModule.UTF8ToString(s3);  // 把 char* 指標 轉成 JS 字串
        ////c++以 .c_str()回傳之指標 js端 不可,亦不須要 釋放該指標,以免造成非預期結果
        //mainModule._free(s3);

        //console.log("ip= " + ip + " ;wasm is_enable= " + b1 + " ; userData_key= " + s3+" ; sub(5,3)=" + n1);

        //設定 wasm (主模組:mainModule)模組元件 之全域物件變數 userData 物件 內容值(key,is_enable),以設定是否 開啟 該模組 之 所有 功能函式;
        //預設所有功能函為關閉,除非經key驗證過

        //f:void set_UserData()
        mainModule.ccall('set_UserData', 'string', [], []);

        let ip2 = mainModule.ccall('getIP', 'number', [], []);
        message = mainModule.UTF8ToString(ip2);  // 把 char* 指標 轉成 JS 字串
        //記得釋放記憶體
        mainModule._free(ip2);

        //f:int sub(int a, int b)
        let n2 = mainModule.ccall('sub', 'number', ['number', 'number'], [5, 3]);

        //f:bool getEnable()
        let b2: boolean= mainModule.ccall('getEnable', 'number', [], []);//1-->true;

        //f:const char* get_userData_key()
        let s4 = mainModule.ccall('get_userData_key', 'string', [], []);//ok;較簡潔
        ////c++以 .c_str()回傳之指標 js端 不可,亦不須要 釋放該指標,以免造成非預期結果
        //let s5 = mainModule.ccall('get_userData_key', 'number', [], []);
        //message = mainModule.UTF8ToString(s5);//效果同上

        //console.log("ip2= " + ip2 + " ;wasm is_enable= " + b2+ " ; sub(5,3)=" + n2);

        console.log("ip= "+s4);

        k = 1;
        */
        ////f1:double subD(double deg, double a) //test ok
        ////sin(30/180*pi)=0.5
        //let mdeg = 20;
        //let ma = 10;
        //let mx = mainModule.ccall('subD',
        //    'number',
        //    ['number', 'number'],
        //    [mdeg, ma]);
        //console.log("mainModule.subD() =" + mx);
        ////f2:void setJSMessageTest() ;呼叫執行前端js的WebWasm.setMessage(message)功能函式 //test ok
        //mainModule.ccall('setJSMessageTest',
        //    'void',
        //    [],
        //    []);
        //console.log("mainModule.setJSMessageTest() ; WebWasm.message=" + WebWasm.message);
        //k = 1;
        //#endregion
        //b.副模組 物件 功能函式測試:--------------
        //CameraModule.wasm:[10]
        //wasmModule = WebWasm.allWasmModuleObjs[10];
        //pr = wasmModule.ccall('add', 'number', ['number', 'number'], [1, 2]);
        //let x = 1;
        //TriboGDIModule.wasm:[9]
        //wasmModule = WebWasm.allWasmModuleObjs[9];
        //ptall = wasmModule.ccall('add', 'number', ['number', 'number'], [1, 2]);
        //RoadModule.wsam:
        //wasmModule = WebWasm.allWasmModuleObjs[8];
        //f:int add(int a, int b)
        //ptall = wasmModule.ccall('add', 'number', ['number', 'number'], [1, 2]);
        //LineServiceModule.wasm:
        //#region 
        //wasmModule = WebWasm.allWasmModuleObjs[7];
        ////f: vector<Point>*  getPoints(vector<Point>* pts,int* rcount)
        ////以 指標 執行 IO:
        //let pts = new Array();
        //let temp: Point;
        //for (let i = 0; i<5; i++)
        //{
        //    temp = new Point([i + 0.1, i + 0.01, i + 0.001]);
        //    pts.push(temp);
        //}
        //let pr = WebWasm.createPointer_Points(wasmModule, pts);//取得所有point資料之指標
        //let prInt = WebWasm.createPointer_INT(wasmModule, 12);//int指標;記錄回傳之陣列長度大小值
        //#region 
        //let pi1 = WebWasm.createPointer_INT(wasmModule, 0);
        //let pi2 = WebWasm.createPointer_INT(wasmModule, 0);
        //let pi3 = WebWasm.createPointer_INT(wasmModule, 0);
        //let pi4 = WebWasm.createPointer_INT(wasmModule, 0);
        ////f: Point* getPointsC(Point *pts, int ptsCounts , int *rcount):ok
        //let ptall = wasmModule.ccall('getPointsC', 'number', ['number', 'number', 'number'], [pr, pts.length, prInt]);
        //let rpts = Point.getObjFromWasmPointer_Size(wasmModule, ptall, pts.length);
        //let retCounts = WebWasm.getPointerValue_INT(wasmModule, prInt);
        //f: Point* getPointsB(double* pts,int ptsCounts,int* rcount):ok
        //prInt = WebWasm.createPointer_INT(wasmModule, 0);
        //let ptt = wasmModule.ccall('getPointsB', 'number', ['number', 'number', 'number'], [pr, 1, prInt]);
        //let vtest = WebWasm.getPointerValue_INT(wasmModule, prInt);
        //let vptt = Point.getObjFromWasmPointer_Size(wasmModule, ptt, pts.length);
        //#endregion  
        ////f:  Point* getPointsD(vector<Point> *pts,  int *rcount) : err!!--> 型別: vector<Point> js無法正確傳入識別使用
        //let retPr = wasmModule.ccall('getPointsD', 'number', ['number', 'number'], [pr, prInt]);
        ////let retPr = wasmModule.ccall('getPointsD', 'number', ['number', 'number'], [pts, prInt]);
        //let rpts = Point.getObjFromWasmPointer_Size(wasmModule, retPr, pts.length);
        //let vi = WebWasm.getPointerValue_INT(wasmModule, prInt);
        ////釋放所有點位之指標記憶體:
        //wasmModule._free(pr);
        //wasmModule._free(prInt);
        //let x = 1;
        //let rc = 0;
        //let intBytes = wasmModule.HEAP32.BYTES_PER_ELEMENT;
        //let pr1 = wasmModule._malloc((1 * intBytes));
        //wasmModule.HEAP32.set([rc], (pr1 / intBytes));
        //let ptvs = wasmModule.ccall('getPoints', 'number', ['number', 'number'], [pts, pr1]);
        //let size;
        //size = new Int32Array(wasmModule.buffer, pr1, 1)[0];
        //wasmModule._free(pr1);
        // 整數 傳址 呼叫 (可用於記錄,取得wasm回傳之陣列大小值):ok-------------
        //let pr1 = WebWasm.createPointer_INT(wasmModule, 20);
        //let ptvs = wasmModule.ccall('setInt', 'void', ['number'], [pr1]);
        //let vpr1 = WebWasm.getPointerValue_INT(wasmModule,pr1);
        //--------------------------------------------------------------------
        //輸入參數 (物件) 記憶體配置: ok ---------------
        //let p = new Point([0.1, 0.2, 0.3]); 
        //let pa = [0.1, 0.2, 0.3];
        //let arrayLength = pa.length;
        //let bytesPerElement = wasmModule.HEAPF64.BYTES_PER_ELEMENT;
        //let arrayPointer = wasmModule._malloc((arrayLength * bytesPerElement));
        //wasmModule.HEAPF64.set(pa, (arrayPointer / bytesPerElement));//ok
        //let ptvs2 = wasmModule.ccall('getPoint', 'number', ['number'], [arrayPointer]);
        //let pt2: Point;
        //pt2 = Point.getObjFromWasmPointer(wasmModule, ptvs2);
        //wasmModule._free(arrayPointer);
        //-----------------------------
        ////物件 直傳-->error!!
        //let ptvs3 = wasmModule.ccall('getPoint', 'number', ['number'], [p]);
        //let pt3: Point;
        //pt3 = Point.getObjFromWasmPointer(wasmModule, ptvs3);
        ////ok
        //let ptvs4 = wasmModule.ccall('getPointB', 'number', ['number', 'number', 'number'], [p.x, p.y, p.z]);
        //let pt4: Point;
        //pt4 = Point.getObjFromWasmPointer(wasmModule, ptvs4);
        //let i = 0;
        //#endregion
        //RayModule:
        //#region 
        //wasmModule= WebWasm.allWasmModuleObjs[6];
        ////let ptvs = WebWasm.allWasmModuleObjs[6].ccall('add', 'number', ['number', 'number'], [3, 4]);
        //let ptvs = wasmModule.ccall('getNULLPoint', 'number', [], []);
        //let pt = Point.getObjFromWasmPointer(wasmModule, ptvs);
        //#endregion
        //MapServiceModule.wasm : (MapService功能模組)
        //#region 
        //WebWasm.allWasmModuleObjs[5];
        //wasmModule = WebWasm.allWasmModuleObjs[5];
        ////f:Wgs84PointInfo*  GetWgs84PointInfo(double wgs84_x, double wgs84_y,int scale)
        //let d1, d2;
        //d1 = 121.448468;
        //d2 = 25.045347;
        //let sc = 18;
        //let buffer;
        //buffer = WebWasm.allWasmModuleObjs[5].buffer;
        //let ptvs = WebWasm.allWasmModuleObjs[5].ccall('GetWgs84PointInfo', 'number', ['number', 'number', 'number'], [d1, d2, sc]);
        ////取得wasm模組指標對應之Wgs84PointInfo物件:
        //let wgs84PointInfo: Wgs84PointInfo = new Wgs84PointInfo([]);
        //wgs84PointInfo = Wgs84PointInfo.getObjFromWasmPointer(WebWasm.allWasmModuleObjs[5], ptvs);
        //#region 
        /*
        //Wgs84PointInfo資料格式:6d+2int+3d(x,y,z)
        //let offsetCounts2 = 3;//每個Point物件有3個double
        //let d6 = new Float64Array(buffer, ptvs2, 100 * offsetCounts2);//每個Point物件有3個double

        let counts = 1;
        let bytesFloat64 = 8;//每個Float64= 8 bytes,Int32=4 bytes
        let bytesInt32 = 4;//每個Float64= 8 bytes,Int32=4 bytes
        let bytesOffset = 0;

        bytesOffset = ptvs2;
        let d6 = new Float64Array(buffer, bytesOffset, 6 * counts);//6d

        bytesOffset = bytesOffset + 6 * counts * bytesFloat64;
        let int2 = new Int32Array(buffer, bytesOffset, 2 * counts);//2d

        bytesOffset = bytesOffset + 2 * counts * bytesInt32;
        let d3 = new Float64Array(buffer, bytesOffset, 3 * counts);//3d(x,y,z)
        let pt: Point = new Point([ d3[0], d3[1], d3[2] ]);

        let wgs84PointInfo: Wgs84PointInfo = new Wgs84PointInfo([]);
        //double wgs84_x = -1;
        //double wgs84_y = -1;
        //double ratio_x = -1;
        //double ratio_y = -1;
        //double picture_left_up_wgs84_x = -1;
        //double picture_left_up_wgs84_y = -1;
        //int targat_picture_x_index = -1;
        //int targat_picture_y_index = -1;
        wgs84PointInfo.wgs84_x = d6[0];
        wgs84PointInfo.wgs84_y = d6[1];
        wgs84PointInfo.ratio_x = d6[2];
        wgs84PointInfo.ratio_y = d6[3];
        wgs84PointInfo.picture_left_up_wgs84_x = d6[4];
        wgs84PointInfo.picture_left_up_wgs84_y = d6[5];
        wgs84PointInfo.targat_picture_x_index = int2[0];
        wgs84PointInfo.targat_picture_y_index = int2[1];

        wgs84PointInfo.positionAtTargetPicturePT = pt;//d3[]
        */
        //#endregion
        ////f: int add(int a, int b) :ok
        //let x = WebWasm.allWasmModuleObjs[5].ccall('add', 'int', ['number', 'number'], [2,3]);
        //console.log("x ="+x);
        //#endregion
        //CanvasGL0.wasm:
        //#region 
        /*
        //以 直接執行簡易之js code:
        //f: void runJS() :
        WebWasm.allWasmModuleObjs[4].ccall('runJS', 'void', [], []);


        //取得設定現行元件版本:
        //f: const char* getVer(): ok
        let version: string;
        version = WebWasm.allWasmModuleObjs[4].ccall('getVer', 'string', [], []);
        console.log("version=" + version);

        
        //f: int getKey(): ok
        let key: number;
        key = WebWasm.allWasmModuleObjs[4].ccall('getKey', 'number', [], []);
        console.log("key=" + key);
        */
        //#endregion
        //order.wasm: ok
        //#region 
        //let orderModule = WebWasm.allWasmModuleObjs[4];
        ////f: int sub(int a, int b)
        //let oa = 10;
        //let ob = 20;
        //let ox = orderModule.ccall('sub',
        //    'number',
        //    ['number', 'number'],
        //    [oa, ob]);
        //console.log("orderModule.sub(10,20) =" + ox);
        ////f: void addStr(const char* str1, const char* str2)
        //let os1 = "abc 中文";
        //let os2 = "123 def 英文 xyz";
        //let ors = orderModule.ccall('addStr',
        //    'void',
        //    ['string', 'string'],
        //    [os1,os2]);
        //console.log("orderModule.addStr() =" + WebWasm.message);
        //#endregion
        //product.wasm: ok
        //#region 
        //let productModule = WebWasm.allWasmModuleObjs[3];
        ////f: const char* addSXX(const char* a, const char* b):ok wasm可 return 字串(const char* )
        //let ps1 = "abc 中文";
        //let ps2 = "123 def 英文 xyz";
        //let prs = productModule.ccall('addSXX',
        //    'string',
        //    ['string', 'string'],
        //    [ps1, ps2]);
        //console.log("productModule.addSXX() ; prs=" +prs);
        ////console.log("productModule.addSXX(); WebWasm.message =" + WebWasm.message);
        ////f: int addint(int a,int b) 
        //let pa = 10;
        //let pb = 20;
        //let px = productModule.ccall('addint',
        //    'number',
        //    ['number', 'number'],
        //    [pa, pb]);
        //console.log("productModule.addint(10,20) =" + px);
        //console.log("productModule.addint(); WebWasm.message =" + WebWasm.message);
        ////f:double getSin(double deg)
        //let pdeg = 30;
        //let psx = productModule.ccall('getSin','number', ['number'], [pdeg]);
        //console.log("productModule.getSin(30) =" + psx);
        //#endregion
        //MapDataEarth.wasm:
        //#region
        //let MapDataEarthModule = WebWasm.allWasmModuleObjs[1];
        ////int add(int a, int b)
        ////double get_maps_x_ratio(int i)
        ////int add(int a, int b)
        //let pa = 10;
        //let pb = 20;
        //let px = MapDataEarthModule.ccall('add',
        //    'number',
        //    ['number', 'number'],
        //    [pa, pb]);
        //console.log("MapDataEarthModule.add(10,20) =" + px);
        ////double get_maps_x_ratio(int i)
        //let i = 2;
        ////let ri1 = MapDataEarthModule.ccall('get_maps_x_ratio', 'number', ['number'], [i]);
        ////let ri1 = MapDataEarthModule.ccall("get_maps_x_ratio", "number", ["number"], [i]);
        //let ri1 = WebWasm.allWasmModuleObjs[1].ccall("get_maps_x_ratio", "number", ["number"], [i]);
        //console.log("MapDataEarthModule.get_maps_x_ratio(2) =" + ri1);
        //#endregion
        //EarthMap.wasm:
        //#region 
        /*
        //let pt = WebWasm.allWasmModuleObjs[3].ccall('get_Point', 'int', ['number', 'number', 'number'], [1.1, 2.2, 3.3]);

        //f: const char* addStr(const char* a, const char* b):ok
        let s1 = WebWasm.allWasmModuleObjs[3].ccall('addStr', 'string', ['string', 'string'], ["abc 中英文 ", "def 中文 123"]);
        console.log("s1=" + s1);

        //取得模組之buffer物件:
        let buffer;
        //let mem;
        //let buffer2;

        buffer = WebWasm.allWasmModuleObjs[3].buffer;//ok
        //buffer = WebWasm.allWasmModuleObjs[3]._getBuffer();//ok
        //mem = WebWasm.allWasmModuleObjs[3]._getMemory();
        //buffer2 = mem.buffer;

        //f: Point* get_allPoints_Vector2() :回傳Point陣列 ok(直接以區域變數回傳)
        let ptvs2 = WebWasm.allWasmModuleObjs[3].ccall('get_allPoints_Vector2', 'int', [], []);
        let offsetCounts2 = 3;//每個Point物件有3個double
        let allptsdata2 = new Float64Array(buffer, ptvs2, 100 * offsetCounts2);//每個Point物件有3個double


        //取得所有Point物件
        let allpte2 = new Array();
        let tempPT2: Point;
        for (let i = 0; i < 100; i++) {
            tempPT2 = new Point([]);
            tempPT2.x = allptsdata2[i * offsetCounts2];
            tempPT2.y = allptsdata2[i * offsetCounts2 + 1];
            tempPT2.z = allptsdata2[i * offsetCounts2 + 2];

            allpte2.push(tempPT2);
        }



        //f: Point* get_allPoints_Vector() :回傳Point陣列 ok (以全區域變數回傳)
        let ptvs = WebWasm.allWasmModuleObjs[3].ccall('get_allPoints_Vector', 'int', [], []);

        let offsetCounts = 3;//每個Point物件有3個double
        let allptsdata = new Float64Array(buffer, ptvs, 100 * offsetCounts);//每個Point物件有3個double
        

        //取得所有Point物件
        let allpte = new Array();
        let tempPT: Point;
        for (let i = 0; i < 100; i++)
        {
            tempPT = new Point([]);
            tempPT.x = allptsdata[i * offsetCounts];
            tempPT.y = allptsdata[i * offsetCounts+1];
            tempPT.z = allptsdata[i * offsetCounts + 2];

            allpte.push(tempPT);
        }


        //f: vector<int>* get_intsVector()
        let aryints = WebWasm.allWasmModuleObjs[3].ccall('get_intsVector', 'int', [], []);
        let allints = new Int32Array(buffer, aryints, 100);

        //f: int* get_AllInts():ok
        let intsp = WebWasm.allWasmModuleObjs[3].ccall('get_AllInts', 'int', [], []);
        let ints = new Int32Array(buffer, intsp, 100);

        //f: int get_tempCount()
        let tempCount = WebWasm.allWasmModuleObjs[3].ccall('get_tempCount', 'int', [], []);

        
        //f: Point* get_Point(double x, double y, double z)
        let pt = WebWasm.allWasmModuleObjs[3].ccall('get_Point', 'int', ['number', 'number', 'number'], [1.1, 2.2, 3.3]);

        //let dataBuffer = new Float32Array(buffer, pt, 1 * 3);
        //a.直接以型別資料型別取得回傳值:(適用單一型別之回傳資料)
        let das = new Float64Array(buffer, pt, 1 * 3);
        let dasx = das[0];
        let dasy = das[1];
        let dasz = das[2];

        //b.以DataView取得回傳值:(適用所有複雜型別之回傳資料)
        var dv = new DataView(buffer, pt, 8 * 3);
        let ptx = dv.getFloat64(0, true);
        let pty = dv.getFloat64(8, true);
        let ptz = dv.getFloat64(16, true);


        let xxx = 0;

        ////Point getPT3DFromLonLat(double longitude , double latitude , double R )
        //let pt: Point = WebWasm.allWasmModuleObjs[3].ccall('getPT3DFromLonLat', 'Point', ['number', 'number', 'number'], [5.0,6.0,7.0 ]);
        //console.log("pt()=(" + pt.x + "," + pt.y + "," + pt.z + ",");
       */
        //#endregion
    }
    //初始化 物件成員變數
    initObjectVar() {
    }
    /**取得,設定wasm之傳遞訊息 (wasm 呼叫使用)*/
    static setMessage(message) {
        WebWasm.message = message;
        console.log("WebWasm.message:" + WebWasm.message);
    }
}
//static 屬性:
WebWasm.isUseWasm = true;
//static isUseWasm: boolean = false;
//'./js/mapgl/wasm/validate_product.wasm'
/**所有 副 模組 wasm 之url檔案路徑*/
WebWasm.allWasmFileNames = new Array();
/**所有模組總數,全數載入完成再執行繪圖;CanvasGL0.drawScenes()*/
WebWasm.allWasmCount = -1;
/**現行所有模組載入完成總數*/
WebWasm.currentWasmCount = 0;
/**所有模組物件*/
WebWasm.allWasmModuleObjs = null;
/**所有模組是否全部載入完成*/
WebWasm.isLoadComplete = false;
/**所有模組載入完成時間*/
WebWasm.loadTime = -1;
WebWasm.startTime = -1;
//所有 wasm 模組 對應 物件:
WebWasm.MainWasm = null;
WebWasm.MapboxModule = null;
WebWasm.RayModule = null;
//# sourceMappingURL=WebWasm.js.map
