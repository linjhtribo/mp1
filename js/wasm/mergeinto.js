mergeInto(LibraryManager.library,
    {
        //c++呼叫執行前端之js function宣告:

        //實作於前端之對應js function

        //主模組:
        //for test:ok
        updateMessage: function (messagePointer)
        {
            WebWasm.setMessage(Module.UTF8ToString(messagePointer));
        },

        //動態建立執行js 函式-------------
        //取得 wasm 現行佈署執行 之 主機 ip: 
        getHostIP: function (pr_module_name)
        {
            let module_name = Module.UTF8ToString(pr_module_name);

            let pr = Module.allocateUTF8(new Function(WebWasm.MainWasm.ccall('get_string_verify', 'string', [], []))());

            return pr; //!! js 端須執行 釋放 記憶體 指標 Module._free(pr)

        },
       

        // js 端 釋放 記憶體 指標
        freePR: function (pr_ip, pr_module_name)
        {
            let module_name = Module.UTF8ToString(pr_module_name);

            //console.log("module_name= " + module_name + " ; freePR : pr= " + pr_ip);

            Module._free(pr_ip);
        },


        //for test:----------------------
        addFun: function (a,b)
        {
            //js 回傳值為 非字串: 直接回傳其值即可,不須另外處理

            return new Function("a", "b", "return (a+b);")(a, b);//動態建立並直接執行js函式
        },


        //取得 wasm 現行佈署執行 之 主機 ip: 
        getHostIP2: function (pr_module_name) {
            let module_name = Module.UTF8ToString(pr_module_name);

            //console.log("window.location.origi=" + new Function("return " + "window.location.origin;")());//ok
            //return new Function("return " + "window.location.origin;")();//直接執行

            //js 回傳值為 字串: 須另外對回傳字串編碼及記憶體配置並回傳其記憶體指標, wasm元件才可
            //正確解析取得該字串內容值

            let str = new Function("return " + "window.location.origin;")();//ok



            //return str;//不可直接回傳 js 之 字串 內容,會得到非預期結果值

            //A.使用 Module._malloc 編碼 js字串 並取得回傳其指標:
            //#region 
            /*
            // 把 JS 字串轉成 UTF-8 Uint8Array
            let encoder = new TextEncoder();
            let encoded = encoder.encode(str);

            // 分配記憶體
            let ptr = Module._malloc(encoded.length);

            // 把字串寫進 WASM 的記憶體
            Module.HEAPU8.set(encoded, ptr);//Module : 主模組 之 js 物件 (mainWasm.js)

            console.log("getHostIP: str= " + str + " ; length= " + encoded.length + " ; pr= " + pr + " ; encoded= " + encoded);

            // 記得釋放記憶體
            //不可於此釋放記憶體,否則wasm取得之該指標內容值(字串)會非預期;須於wasm取得該指標之內容值後再釋放記憶體,
            //或不做記憶體釋放避免取得非預期結果
            //Module._free(ptr);
            */
            //#endregion

            //B.使用 allocateUTF8 編碼 js字串 並取得回傳其指標:
            //較為簡潔,但於compile時須加入export 'allocateUTF8' 該方法
            //emcc mainWasm.cpp -std=c++1z --js-library mergeinto.js -s MAIN_MODULE=1 -s MODULARIZE=1 -s EXPORT_ALL
            //-s EXTRA_EXPORTED_RUNTIME_METHODS = ['ccall', 'stringToUTF8', 'UTF8ToString', 'allocateUTF8'] - o mainWasm.js

            let pr = Module.allocateUTF8(str);

            //console.log("module_name= " + module_name+" ; getHostIP: str= " + str +" ; pr= " + pr);

            return pr; //!! js 端須執行 釋放 記憶體 指標 Module._free(pr)


        },


        getStr2: function ()
        {
            let text = 'return "abc 測試!!";';

            //A.使用 Module._malloc 編碼 js字串 並取得回傳其指標:
            //const encoder = new TextEncoder();
            //const encoded = encoder.encode(text);

            //// 分配記憶體，多一個 byte 給 null 結尾
            //const ptr = Module._malloc(encoded.length + 1);
            //Module.HEAPU8.set(encoded, ptr);
            //Module.HEAPU8[ptr + encoded.length] = 0; // null terminator

            //// 轉成 JS 字串
            //const jsString = Module.UTF8ToString(ptr);

            //// 釋放記憶體
            //Module._free(ptr);

            //B.使用 allocateUTF8 編碼 js字串 並取得回傳其指標:
            //較為簡潔,但於compile時須加入export 'allocateUTF8' 該方法
            //emcc mainWasm.cpp -std=c++1z --js-library mergeinto.js -s MAIN_MODULE=1 -s MODULARIZE=1 -s EXPORT_ALL
            //-s EXTRA_EXPORTED_RUNTIME_METHODS = ['ccall', 'stringToUTF8', 'UTF8ToString', 'allocateUTF8'] - o mainWasm.js

            let pr = Module.allocateUTF8(text);

            return pr;
        },
        

        //WinOnLoad.wasm:
        //#region 
        /*
        //setGVar():
        //建立取得設定網頁所有相關之全域變數:
        winOnLoad_setGVar: function () { setGVar(); },
        //UIVar.initStaticVar();:
        //建立取得設定網頁所有相關之全域變數:
        winOnLoad_UIVar_initStaticVar: function () { UIVar.initStaticVar();; },
        //建立並設定所有class的static成員變數
        //SetAllClassStaticVar.setAllStaticVars();
        winOnLoad_SetAllClassStaticVar_setAllStaticVars: function () { SetAllClassStaticVar.setAllStaticVars(); },
        //設定所有canvas物件欲顯示的畫面大小值
        //setAllCanvasSize();
        winOnLoad_setAllCanvasSize: function () { setAllCanvasSize(); },
        //注意圖台輔助物件產生順序須為: 1.mapData0-->2.perspectiveMatrix0-->camera0-->CanvasGL0
        //1.建立,初始化所有CanvasGLRender物件對應使用的MapData物件(全域物件):mapData0,1,2,3...
        //createAllMapData();
        winOnLoad_createAllMapData: function () { createAllMapData(); },
        //2.建立,設定所有CanvasGLRender物件對應使用的PerspectiveMatrix物件(全域物件):perspectiveMatrix0,1,2,3...
        //createAllPerspectiveMatrix();
        winOnLoad_createAllPerspectiveMatrix: function () { createAllPerspectiveMatrix(); },
        //3.建立,設定所有CanvasGLRender物件對應使用的Camera物件(全域物件):camera0,1,2,3...
        //createAllCamera();
        winOnLoad_createAllCamera: function () { createAllCamera(); },
        //4.建立並設定所有canvas對應的CanvasGLRender物件(全域物件):CanvasGL0,1,2,3.....
        //createAllCanvasGLRender();
        winOnLoad_createAllCanvasGLRender: function () { createAllCanvasGLRender(); },
        //5.為所有元件加入事件處理
        //addAllUIListener();
        winOnLoad_addAllUIListener: function () { addAllUIListener(); },
        //方式1:一般預設自動廻圈繪圖
        //drawAllCanvasGL();//遞廻執行繪出所有場景:CanvasGL0,CanvasGL1..
        winOnLoad_drawAllCanvasGL: function () { drawAllCanvasGL(); },
        //方式2:自訂timer繪圖
        //drawAllCanvasGL_Timer();
        winOnLoad_drawAllCanvasGL_Timer: function () { drawAllCanvasGL_Timer(); },
        */
        //#endregion

        //for test:於wasm(c++ code)中新增呼叫執行js函式
        //MapServiceModule.wasm:
        getWgs84Test: function (pt, i, d) { return Wgs84PointInfo.getWgs84Test(pt, i, d); },

      
        

    }
);