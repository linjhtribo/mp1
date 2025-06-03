"use strict";
class WinOnLoad {
    //物件屬性:
    constructor() {
    }
    static init() {
        let k = 1;
        //console.log("WinOnLoad.init()");
        WinOnLoad.loadWasm();
    }
    
    /**載入所有wasm模組,全部載入完成再執行 winOnLoad()*/
    static loadWasm() {
        WebWasm.initStaticVar();
    }
    
    /**loadWasm() complete -->winOnLoad ()*/
    static winOnLoad() {
        console.log("WinOnLoad.winOnLoad()");
        
         let map = new mapboxgl.Map({
            accessToken: WebWasm.MapboxModule.ccall('get_accessToken', 'string', [], []),
            container: 'map',
            style: 'mapbox://styles/mapbox/satellite-v9',//無中文字;不會發生  glyphs > 65535 not supported 錯誤
            //style: 'mapbox://styles/mapbox/satellite-streets-v12',
            //style: 'mapbox://styles/mapbox/streets-v12', // streets 一定要載入 mapbox style 否則很多功能都無法用
            center: [121.506, 25.045], // [121.506,25.045]  [120.892, 23.821]
            preserveDrawingBuffer: true,//讓畫面可供存檔
            language: "zh-Hant",
            projection: 'globe',//預設 投影模式 (若都不指定,系統有時會不穏定,err!!,ex:zoom=2時 )
            //zoom: 7.2, //14
            zoom: 14 
        });
        
        return;
        
        //#region for test 副模組 功能 測試:
        /*
        //for test 副模組 功能 測試:----------
        let moduleObj;
        let module_name: string;
        let is_enable: boolean;
        let module_key: string;

        moduleObj = WebWasm.MapboxModule;
        module_name = moduleObj.ccall('get_userData_name_SM', 'string', [], []);
        is_enable = moduleObj.ccall('getEnable_SM', 'number', [], []);//0-->false ; 1--->true
        module_key = moduleObj.ccall('get_userData_key_SM', 'string', [], []);

        console.log("module_name= " + module_name + " ; is_enable= " + is_enable + " ; module_key= " + module_key);
        //-----------------------
        */
        //#endregion
        //tribo_map.test();
        //建立並設定所有class的static成員變數
        SetAllClassStaticVar.setAllStaticVars();
        //載入 所有 tribo_map 圖資,並繪製於 mapbox
        if (WinOnLoad.is_tribomap)
            tribo_map.init();
        else
            tribo_img.init();
    }
}
//靜態屬性:
/**是否 為 tribo_map.html (展示 向量 圖資)*/
WinOnLoad.is_tribomap = true;
//# sourceMappingURL=WinOnLoad.js.map
