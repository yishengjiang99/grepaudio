import Envelope from "./envelope.js";
window.loadBuffer = function (url) {
    return new Promise((resolve, reject) => {
        var ctx = window.g_audioCtx;
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = "arraybuffer";
        xhr.setRequestHeader("Range", "Bytes:0-");

        xhr.onreadystatechange = function () {
            if (xhr.readyState > 2) {
                // process newData
                if (xhr.response !== null) {
                    ctx.decodeAudioData(xhr.response, function (processed) {
                        var source = ctx.createBufferSourceNode();
                        source.buffer = processed;
                        Promise.resolve(source);
                    });
                }
            }
        };
    });
};
window.get_db = function (ref) {
    if (!window.db) {
        firebase.initializeApp(firebaseConfig);
        window.db = firebase.database();
    }
    if (ref) return window.db.ref(ref);
    else return window.db;
};
window.db_presense = function (userId) {
    get_db("channel/" + userId).set({
        id: userId,
        online: true,
        liveSince: new Date().toDateString(),
    });
    window.onunload = function () {
        get_db("channel/" + userId).update({
            online: false,
            offlineAt: new Date(),
        });
    };
};
window.hashParams = function () {
    var hash = window.location.hash.substring(1);
    var params = {};
    hash.split("&").map((hk) => {
        let temp = hk.split("=");
        params[temp[0]] = temp[1];
    });
    return params;
};
window.toDecibel = function (powerLevel) {
    return 10 * Math.log10(powerLevel);
};
export const HZ_LIST = new Float32Array([
    31.25,
    62.5,
    125,
    250,
    500,
    1000,
    2000,
    4000,
    8000,
    16000,
]);
export const Q = 1.2247449;
export const DEFAULT_PRESET_GAINS = {
    "125": 0.375,
    "250": 0.375,
    "500": 0.375,
    "1000": 0.375,
    "2000": 0.375,
    "4000": 0.6,
    "8000": 0.5,
    "16000": 0,
    "31.25": 0.375,
    "62.5": 0.375,
};
window.$ = function (str) {
    var t = document.getElementById(str);
    if (t !== null && typeof t !== "undefined") return document.getElementById(str);
    return document.querySelector(str);
};
HTMLElement.prototype.appendstr = function (string) {
    let node = document.createRange().createContextualFragment(string);

    this.appendChild(node);
};
export async function chord(url, params) {
    const {min, max, attack, decay, sustain, release} = Object.assign({
        min: 0,
        max: 0.5,
        attack: 0.15,
        decay: 0.21,
        sustain: 0.21,
        release: 0.01,
        ...params,
    });
    var str = await fetch(url).then((resp) => resp.text());
    var json = await JSON.parse(str);
    chord;
    var osc = g_audioCtx.createOscillator();
    osc.setPeriodicWave(g_audioCtx.createPeriodicWave(json.real, json.imag));
    const keys = "asdfghj".split("");
    const notes = "261.63, 293.66 , 329.63, 349.23, 392.00, 440.00, 493.88".split(", ");
    var masterGain = g_audioCtx.createGain();
    masterGain.gain.setValueAtTime(1, g_audioCtx.currentTime);

    var adsrs = [];
    var ctx = g_audioCtx;
    var waveform = g_audioCtx.createPeriodicWave(json.real, json.imag);

    function createKey(i) {
        var osc1 = ctx.createOscillator();
        osc1.frequency.value = notes[i];
        osc1.type = "sine";

        var osc2 = ctx.createOscillator();
        osc2.frequency.value = notes[i] * 2;
        osc2.type = "sawtooth";

        var gain = ctx.createGain();
        gain.gain.value = 0;

        osc1.setPeriodicWave(waveform);
        var gainEnvelope = new Envelope(min, max, attack, decay, sustain, release, gain.gain);
        adsrs[i] = gainEnvelope;
        osc1.connect(gain);
        gain.connect(masterGain);
        osc1.start(0);
        return gainEnvelope;
    }

    var lastkeydown = {};

    window.addEventListener("keydown", function (e) {
        var i = keys.indexOf(e.key);

        if (i > -1) {
            if (!adsrs[i]) {
                adsrs[i] = createKey(i);
            }
            var env = adsrs[i];

            if (e.repeat) {
                env.hold(ctx.currentTime);
            } else {
                env.trigger(ctx.currentTime);
            }
            lastkeydown[e.key] = ctx.currentTime;
        }
    });

    window.addEventListener("keyup", function (e) {
        if (keys.indexOf(e.key) > -1) {
            var env = adsrs[keys.indexOf(e.key)];
            env.release(ctx.currentTime);
        }
    });

    return masterGain;
}

export const NYQUIST_DOGMA_f32 = new Float32Array([
    10.7861328125,
    10.868687288802747,
    10.951873617287943,
    11.035696634000777,
    11.120161212000435,
    11.205272261643263,
    11.291034730868356,
    11.377453605485098,
    11.464533909463114,
    11.552280705224238,
    11.640699093936908,
    11.729794215812682,
    11.819571250405023,
    11.910035416910512,
    12.00119197447216,
    12.093046222485242,
    12.18560350090529,
    12.278869190558613,
    12.372848713455078,
    12.46754753310327,
    12.562971154828222,
    12.659125126091345,
    12.75601503681305,
    12.853646519697598,
    12.952025250560668,
    13.051156948659267,
    13.151047377024186,
    13.251702342795125,
    13.353127697558188,
    13.455329337686175,
    13.558313204681244,
    13.66208528552046,
    13.7666516130037,
    13.8720182661045,
    13.978191370323412,
    14.085177098044037,
    14.192981668891997,
    14.301611350096366,
    14.411072456854157,
    14.521371352697328,
    14.63251444986284,
    14.744508209665323,
    14.857359142872806,
    14.971073810085175,
    15.085658822115535,
    15.201120840374625,
    15.317466577257964,
    15.434702796536213,
    15.55283631374823,
    15.671873996597437,
    15.791822765351018,
    15.91268959324215,
    16.034481506875558,
    16.157205586635836,
    16.280868967099213,
    16.405478837448197,
    16.53104244188961,
    16.65756708007572,
    16.785060107528512,
    16.913528936067436,
    17.04298103424024,
    17.17342392775707,
    17.30486519992815,
    17.43731249210446,
    17.570773504122133,
    17.70525599474991,
    17.840767782140382,
    17.977316744284312,
    18.11491081946882,
    18.253558006738675,
    18.393266366361505,
    18.534044020296186,
    18.675899152665284,
    18.81884001023051,
    18.962874902872436,
    19.108012204073376,
    19.254260351404355,
    19.40162784701546,
    19.550123258130274,
    19.69975521754384,
    19.850532424124488,
    20.002463643319693,
    20.155557707665473,
    20.30982351730005,
    20.465270040481073,
    20.621906314107175,
    20.779741444243225,
    20.938784606649676,
    21.09904504731614,
    21.26053208299872,
    21.423255101761843,
    21.58722356352383,
    21.75244700060704,
    21.91893501829186,
    22.08669729537527,
    22.255743584733413,
    22.426083713888566,
    22.597727585580596,
    22.770685178342458,
    22.944966547080522,
    23.120581823658895,
    23.297541217488654,
    23.475855016121145,
    23.655533585846257,
    23.83658737229497,
    24.01902690104655,
    24.202862778240636,
    24.38810569119358,
    24.574766409020047,
    24.76285578325878,
    24.952384748503693,
    25.143364323039478,
    25.335805609482023,
    25.52971979542412,
    25.725118154085592,
    25.92201204496889,
    26.120412914519267,
    26.320332296790422,
    26.521781814114927,
    26.724773177779817,
    26.92931818870763,
    27.135428738142217,
    27.34311680834028,
    27.552394473267732,
    27.76327389930184,
    27.975767345938284,
    28.189887166504086,
    28.405645808875672,
    28.623055816202434,
    28.842129827636153,
    29.06288057906552,
    29.2853209038568,
    29.50946373359963,
    29.735322098859083,
    29.962909129932903,
    30.192238057615103,
    30.42332221396501,
    30.656175033082256,
    30.890810051887968,
    31.127240910911492,
    31.365481355083674,
    31.605545234535597,
    31.84744650540407,
    32.0911992306428,
    32.33681758083988,
    32.58431583504183,
    32.83370838158341,
    33.08500971892444,
    33.338234456492266,
    33.593397315531455,
    33.850513129959424,
    34.10959684722875,
    34.37066352919635,
    34.633728352998844,
    34.89880661193521,
    35.16591371635546,
    35.43506519455693,
    35.70627669368664,
    35.97956398065127,
    36.2549429430336,
    36.53242959001606,
    36.81204005331168,
    37.09379058810159,
    37.377697573980356,
    37.66377751590787,
    37.95204704516918,
    38.24252292034107,
    38.53522202826655,
    38.83016138503651,
    39.12735813697876,
    39.42682956165522,
    39.72859306886589,
    40.032666201661385,
    40.33906663736261,
    40.647812188588325,
    40.958920804290976,
    41.27241057079981,
    41.5882997128727,
    41.90660659475519,
    42.22734972124878,
    42.55054773878571,
    42.87621943651412,
    43.20438374738938,
    43.53505974927541,
    43.868266666053316,
    44.20402386873943,
    44.542350876610946,
    44.88326735834116,
    45.226793133142486,
    45.57294817191902,
    45.92175259842718,
    46.27322669044602,
    46.627390880955616,
    46.98426575932541,
    47.343872072510706,
    47.70623072625929,
    48.07136278632624,
    48.43928947969929,
    48.81003219583187,
    49.1836124878878,
    49.56005207399315,
    49.93937283849964,
    50.32159683325632,
    50.706746278892076,
    51.09484356610692,
    51.48591125697406,
    51.879972086251456,
    52.277048962703226,
    52.677164970431996,
    53.08034337022025,
    53.48660760088318,
    53.895981280631034,
    54.308488208441965,
    54.7241523654461,
    55.142997916319125,
    55.5650492106876,
    55.99033078454404,
    56.418867361673854,
    56.850683855092086,
    57.28580536849224,
    57.7242571977055,
    58.16606483217102,
    58.611253956418345,
    59.05985045155995,
    59.51188039679644,
    59.96737007093207,
    60.42634595390305,
    60.88883472831644,
    61.35486328100171,
    61.824458704573786,
    62.29764829900766,
    62.77445957322617,
    63.254920246698475,
    63.7390582510523,
    64.22690173169698,
    64.71847904946036,
    65.2138187822372,
    65.71294972665045,
    66.21590089972578,
    66.72270154057792,
    67.23338111211113,
    67.7479693027313,
    68.26649602807257,
    68.78899143273611,
    69.31548589204245,
    69.84601001379787,
    70.38059464007311,
    70.9192708489971,
    71.46206995656293,
    72.0090235184492,
    72.56016333185373,
    73.11552143734274,
    73.67513012071329,
    74.23902191486991,
    74.80722960171654,
    75.37978621406161,
    75.95672503753912,
    76.53807961254293,
    77.12388373617749,
    77.71417146422172,
    78.30897711310968,
    78.90833526192512,
    79.51228075441158,
    80.12084870099865,
    80.7340744808423,
    81.35199374388252,
    81.97464241291497,
    82.60205668568013,
    83.23427303696727,
    83.87132822073465,
    84.51325927224697,
    85.16010351022751,
    85.81189853902859,
    86.46868225081676,
    87.13049282777652,
    87.79736874432949,
    88.46934876937127,
    89.14647196852538,
    89.82877770641413,
    90.51630564894747,
    91.20909576562849,
    91.90718833187735,
    92.61062393137263,
    93.3194434584106,
    94.03368812028293,
    94.75339943967153,
    95.4786192570637,
    96.20938973318289,
    96.94575335144155,
    97.68775292040927,
    98.43543157630266,
    99.18883278549217,
    99.94800034703,
    100.71297839519504,
    101.48381140206021,
    102.26054418007631,
    103.04322188467846,
    103.83189001691015,
    104.62659442606946,
    105.42738131237353,
    106.23429722964538,
    107.04738908801923,
    107.86670415666907,
    108.69229006655483,
    109.52419481319335,
    110.36246675944686,
    111.20715463833595,
    112.05830755587154,
    112.91597499391091,
    113.78020681303263,
    114.65105325543728,
    115.52856494786629,
    116.4127929045467,
    117.30378853015567,
    118.20160362281001,
    119.10629037707632,
    120.01790138700648,
    120.93648964919399,
    121.86210856585649,
    122.79481194793826,
    123.73465401824078,
    124.68168941457293,
    125.63597319292906,
    126.59756083068811,
    127.5665082298406,
    128.54287172023623,
    129.5267080628612,
    130.51807445313557,
    131.5170285242403,
    132.5236283504662,
    133.53793245059146,
    134.55999979128228,
    135.58988979052236,
    136.6276623210655,
    137.6733777139184,
    138.7270967618454,
    139.78888072290547,
    140.85879132401107,
    141.93689076451832,
    143.02324171984168,
    144.11790734509918,
    145.22095127878163,
    146.33243764645502,
    147.45243106448592,
    148.5809966437999,
    149.71819999366548,
    150.86410722550895,
    152.0187849567576,
    153.1823003147125,
    154.35472094045122,
    155.53611499275965,
    156.72655115209486,
    157.92609862457763,
    159.13482714601582,
    160.3528069859584,
    161.58010895178066,
    162.81680439280075,
    164.06296520442717,
    165.31866383233876,
    166.58397327669616,
    167.85896709638584,
    169.14371941329628,
    170.4383049166272,
    171.74279886723153,
    173.05727710199062,
    174.3818160382235,
    175.7164926781287,
    177.06138461326117,
    178.41657002904324,
    179.78212770930946,
    181.1581370408872,
    182.5446780182113,
    183.94183124797533,
    185.34967795381675,
    186.76829998103935,
    188.1977798013714,
    189.63820051775994,
    191.08964586920203,
    192.55220023561301,
    194.0259486427318,
    195.51097676706394,
    197.00737094086273,
    198.51521815714742,
    200.03460607476117,
    201.565623023467,
    203.10835800908262,
    204.66290071865507,
    206.2293415256743,
    207.8077714953279,
    209.39828238979396,
    211.00096667357653,
    212.61591751888088,
    214.2432288110299,
    215.88299515392234,
    217.5353118755325,
    219.20027503345216,
    220.8779814204747,
    222.5685285702228,
    224.27201476281775,
    225.9885390305934,
    227.71820116385345,
    229.4611017166726,
    231.21734201274234,
    232.98702415126132,
    234.77025101287143,
    236.56712626563788,
    238.37775437107658,
    240.2022405902268,
    242.04069098977058,
    243.8932124481993,
    245.7599126620257,
    247.6409001520476,
    249.53628426965264,
    251.44617520318022,
    253.37068398432285,
    255.30992249458458,
    257.2640034717822,
    259.23304051660267,
    261.217148099203,
    263.2164415658696,
    265.2310371457201,
    267.26105195746317,
    269.3066040162047,
    271.3678122403115,
    273.4447964583214,
    275.5376774159126,
    277.6465767829204,
    279.77161716041394,
    281.9129220878187,
    284.07061605010415,
    286.2448244850158,
    288.4356737903711,
    290.6432913314046,
    292.86780544817594,
    295.10934546302605,
    297.36804168810096,
    299.6440254329223,
    301.9374290120251,
    304.2483857526466,
    306.57703000248017,
    308.92349713748297,
    311.28792356974856,
    313.67044675543434,
    316.07120520275663,
    318.49033848003745,
    320.92798722382423,
    323.38429314706053,
    325.8593990473286,
    328.3534488151473,
    330.86658744234165,
    333.39896103046607,
    335.9507167993045,
    338.5220030954233,
    341.11296940079984,
    343.723766341509,
    346.3545456964832,
    349.00546040633293,
    351.676664582241,
    354.3683135149182,
    357.0805636836363,
    359.8135727653182,
    362.5674996437117,
    365.34250441861997,
    368.1387484152139,
    370.9563941934064,
    373.79560555730774,
    376.65654756474225,
    379.53938653685066,
    382.44429006775323,
    385.37142703429726,
    388.3209676058719,
    391.29308325430236,
    394.2879467638183,
    397.3057322410979,
    400.3466151253912,
    403.4107721987173,
    406.4983815961428,
    409.60962281613735,
    412.7446767310091,
    415.9037255974192,
    419.0869530669777,
    422.2945441969206,
    425.5266854608669,
    428.78356475966035,
    432.0653714322927,
    435.37229626691095,
    438.70453151190895,
    442.06227088710364,
    445.4457095949969,
    448.85504433212384,
    452.2904733004881,
    455.7521962190836,
    459.24041433550553,
    462.7553304376502,
    466.29714886550363,
    469.8660755230215,
    473.4623178900983,
    477.086085034631,
    480.73758762467156,
    484.41703794067456,
    488.12464988783853,
    491.86063900854134,
    495.62522249487023,
    499.4186192012488,
    503.24104965716003,
    507.09273607996624,
    510.97390238782936,
    514.8847742127261,
    518.8255789135669,
    522.7965455894125,
    526.7979050927931,
    530.8298900431289,
    534.892734840253,
    538.9866756780395,
    543.1119505581335,
    547.268799303787,
    551.4574635738024,
    555.6781868765808,
    559.9312145842774,
    564.2167939470681,
    568.5351741075219,
    572.8866061150848,
    577.2713429406765,
    581.6896394913945,
    586.1417526253342,
    590.6279411665214,
    595.1484659199594,
    599.7035896867899,
    604.2935772795715,
    608.9186955376758,
    613.5792133427981,
    618.2754016345895,
    623.0075334264088,
    627.7758838211937,
    632.5807300274538,
    637.4223513753857,
    642.3010293331131,
    647.2170475230486,
    652.1706917383839,
    657.1622499597023,
    662.1920123717217,
    667.2602713801646,
    672.3673216287564,
    677.5134600163552,
    682.6989857142117,
    687.9242001833626,
    693.1894071921538,
    698.4949128339019,
    703.8410255446887,
    709.2280561212913,
    714.6563177392512,
    720.1261259710807,
    725.6377988046078,
    731.1916566614635,
    736.7880224157101,
    742.4272214126091,
    748.1095814875375,
    753.8354329850457,
    759.605108778062,
    765.4189442872442,
    771.2772775004794,
    777.180448992534,
    783.1288019448509,
    789.1226821655016,
    795.1624381092907,
    801.2484208980117,
    807.3809843408594,
    813.5604849550014,
    819.7872819863005,
    826.0617374302022,
    832.3842160527778,
    838.7550854119312,
    845.1747158787662,
    851.6434806591175,
    858.1617558152503,
    864.7299202877178,
    871.3483559173944,
    878.0174474676729,
    884.737582646833,
    891.5091521305804,
    898.3325495847598,
    905.2081716882388,
    912.1364181559705,
    919.1176917622319,
    926.1523983640357,
    933.240946924728,
    940.3837495377619,
    947.5812214506553,
    954.8337810891317,
    962.1418500814431,
    969.5058532828858,
    976.9262188004944,
    984.4033780179332,
    991.9377656205734,
    999.5298196207642,
    1007.179981383296,
    1014.8886956510598,
    1022.6564105709022,
    1030.4835777196774,
    1038.370652130503,
    1046.318092319209,
    1054.3263603109958,
    1062.3959216672952,
    1070.5272455128336,
    1078.7208045629059,
    1086.9770751508559,
    1095.2965372557712,
    1103.6796745303818,
    1112.1269743291807,
    1120.638927736755,
    1129.2160295963365,
    1137.8587785385678,
    1146.5676770104908,
    1155.3432313047576,
    1164.1859515890612,
    1173.0963519357988,
    1182.0749503519519,
    1191.1222688092043,
    1200.2388332742862,
    1209.4251737395507,
    1218.6818242537856,
    1228.0093229532595,
    1237.4082120930093,
    1246.8790380783596,
    1256.4223514966914,
    1266.0387071494492,
    1275.7286640843956,
    1285.4927856281101,
    1295.3316394187393,
    1305.245797438996,
    1315.2358360494109,
    1325.3023360218422,
    1335.445882573235,
    1345.6670653996448,
    1355.96647871052,
    1366.3447212632454,
    1376.8023963979513,
    1387.3401120725887,
    1397.9584808982745,
    1408.658120174902,
    1419.439651927032,
    1430.303702940051,
    1441.2509047966112,
    1452.2818939133465,
    1463.3973115778724,
    1474.5978039860654,
    1485.8840222796302,
    1497.2566225839544,
    1508.7162660462527,
    1520.2636188740012,
    1531.899352373669,
    1543.6241429897434,
    1555.4386723440564,
    1567.3436272754107,
    1579.3396998795072,
    1591.4275875491821,
    1603.6079930149504,
    1615.881624385856,
    1628.2491951906418,
    1640.7114244192273,
    1653.2690365645085,
    1665.9227616644785,
    1678.673335344664,
    1691.5214988608934,
    1704.4679991423916,
    1717.5135888351988,
    1730.6590263459289,
    1743.905075885857,
    1757.252507515349,
    1770.7020971886293,
    1784.2546267988885,
    1797.9108842237401,
    1811.6716633710266,
    1825.537764224968,
    1839.5099928926734,
    1853.5891616510023,
    1867.7760889937856,
    1882.0715996794127,
    1896.4765247787734,
    1910.991701723575,
    1925.617974355029,
    1940.356192972903,
    1955.2072143849557,
    1970.1719019567472,
    1985.251125661831,
    2000.4457621323302,
    2015.7566947098996,
    2031.1848134970787,
    2046.7310154090387,
    2062.3962042257267,
    2078.181290644404,
    2094.0871923325885,
    2110.114833981407,
    2126.2651473593514,
    2142.5390713664456,
    2158.9375520888284,
    2175.461542853757,
    2192.1120042850243,
    2208.889904358812,
    2225.796218459956,
    2242.8319294386542,
    2259.9980276676065,
    2277.2955110995863,
    2294.7253853254592,
    2312.2886636326425,
    2329.986367064011,
    2347.81952447726,
    2365.789172604713,
    2383.896356113594,
    2402.142127666761,
    2420.527547983901,
    2439.053685903195,
    2457.7216184434556,
    2476.5324308667377,
    2495.487216741435,
    2514.58707800585,
    2533.833125032256,
    2553.226476691452,
    2572.768260417804,
    2592.4596122747917,
    2612.3016770210515,
    2632.2956081769285,
    2652.442568091537,
    2672.743728010332,
    2693.2002681432,
    2713.813377733074,
    2734.584255125064,
    2755.514107836128,
    2776.60415262527,
    2797.855615564274,
    2819.2697321089872,
    2840.8477471711353,
    2862.590915190703,
    2884.5005002088587,
    2906.577775941437,
    2928.824025852989,
    2951.2405432313963,
    2973.8286312630544,
    2996.5896031086395,
    3019.524781979441,
    3042.635501214291,
    3065.923104357079,
    3089.3889452348576,
    3113.0343880365454,
    3136.8608073922373,
    3160.869588453118,
    3185.062126971987,
    3209.4398293844015,
    3234.004112890438,
    3258.756405537087,
    3283.6981463012635,
    3308.83078517347,
    3334.1557832420885,
    3359.6746127783194,
    3385.388757321778,
    3411.2997117667337,
    3437.408982449017,
    3463.718087233597,
    3490.228555602813,
    3516.941928745297,
    3543.85975964557,
    3570.983613174323,
    3598.315066179396,
    3625.8557075774406,
    3653.6071384462966,
    3681.5709721180724,
    3709.748834272931,
    3738.142363033603,
    3766.753209060619,
    3795.583035648265,
    3824.633518821291,
    3853.9063474323334,
    3883.4032232601003,
    3913.1258611083126,
    3943.0759889053843,
    3973.2553478048776,
    4003.665692286731,
    4034.308790259248,
    4065.1864231618833,
    4096.300386068799,
    4127.652487793224,
    4159.244550992615,
    4191.078412274608,
    4223.155922303794,
    4255.478945909309,
    4288.049362193242,
    4320.8690646398845,
    4353.939961225798,
    4387.263974530739,
    4420.843041849434,
    4454.679115304193,
    4488.7741619584085,
    4523.1301639309,
    4557.74911851115,
    4592.633038275422,
    4627.783951203747,
    4663.2039007978365,
    4698.894946199872,
    4734.859162312215,
    4771.098639918033,
    4807.615485802848,
    4844.411822877011,
    4881.489790299126,
    4918.851543600398,
    4956.499254809953,
    4994.43511258111,
    5032.661322318616,
    5071.180106306854,
    5109.993703839042,
    5149.104371347409,
    5188.514382534382,
    5228.226028504756,
    5268.2416178988915,
    5308.5634770269335,
    5349.193950004049,
    5390.135398886699,
    5431.390203809955,
    5472.960763125874,
    5514.84949354293,
    5557.058830266498,
    5599.591227140434,
    5642.4491567897285,
    5685.635110764247,
    5729.151599683586,
    5773.001153383022,
    5817.186321060579,
    5861.709671425238,
    5906.573792846262,
    5951.781293503671,
    5997.334801539868,
    6043.236965212433,
    6089.490453048071,
    6136.097953997753,
    6183.062177593036,
    6230.3858541035825,
    6278.071734695885,
    6326.122591593206,
    6374.541218236738,
    6423.330429448005,
    6472.493061592501,
    6522.031972744581,
    6571.950042853614,
    6622.250173911418,
    6672.935290120956,
    6724.00833806634,
    6775.472286884131,
    6827.330128435952,
    6879.584877482418,
    6932.239571858397,
    6985.2972726496155,
    7038.761064370623,
    7092.634055144102,
    7146.919376881558,
    7201.620185465397,
    7256.7396609324,
    7312.28100765858,
    7368.247454545479,
    7424.642255207877,
    7481.468688162941,
    7538.730057020831,
    7596.429690676734,
    7654.570943504413,
    7713.157195551202,
    7772.191852734508,
    7831.67834703981,
    7891.620136720185,
    7952.020706497351,
    8012.88356776425,
    8074.212258789184,
    8136.010344921511,
    8198.281418798922,
    8261.029100556298,
    8324.25703803616,
    8387.96890700074,
    8452.168411345681,
    8516.859283315354,
    8582.045283719828,
    8647.730202153514,
    8713.917857215478,
    8780.612096731418,
    8847.816797977377,
    8915.53586790513,
    8983.77324336933,
    9052.532891356377,
    9121.818809215027,
    9191.63502488879,
    9261.985597150086,
    9332.874615836214,
    9404.3062020871,
    9476.284508584891,
    9548.813719795371,
    9621.898052211222,
    9695.541754597143,
    9769.749108236867,
    9844.524427182048,
    9919.872058503055,
    9995.796382541694,
    10072.30181316585,
    10149.392798026107,
    10227.073818814295,
    10305.34939152404,
    10384.2240667133,
    10463.702429768913,
    10543.789101173174,
    10624.48873677244,
    10705.806028047795,
    10787.745702387803,
    10870.312523363325,
    10953.511291004452,
    11037.34684207955,
    11121.824050376463,
    11206.947826985825,
    11292.723120586596,
    11379.154917733726,
    11466.24824314807,
    11554.008160008489,
    11642.439770246203,
    11731.548214841392,
    11821.338674122067,
    11911.816368065223,
    12002.986556600315,
    12094.854539915035,
    12187.425658763445,
    12280.70529477645,
    12374.698870774679,
    12469.411851083723,
    12564.849741851818,
    12661.018091369937,
    12757.92249039434,
    12855.5685724716,
    12953.962014266106,
    13053.10853589007,
    13153.01390123608,
    13253.68391831217,
    13355.124439579486,
    13457.341362292493,
    13560.340628841846,
    13664.128227099827,
    13768.710190768443,
    13874.092599730251,
    13980.281580401737,
    14087.283306089514,
    14195.103997349219,
    14303.749922347119,
    14413.227397224531,
    14523.542786465001,
    14634.70250326431,
    14746.7130099033,
    14859.580818123562,
    14973.312489506005,
    15087.914635852292,
    15203.393919569244,
    15319.757054056145,
    15437.01080409502,
    15555.161986243927,
    15674.21746923322,
    15794.18417436487,
    15915.069075914835,
    16036.879201538512,
    16159.621632679282,
    16283.303504980207,
    16407.93200869885,
    16533.51438912527,
    16660.05794700326,
    16787.57003895474,
    16916.058077907455,
    17045.529533525932,
    17175.99193264571,
    17307.452859710935,
    17439.919957215254,
    17573.40092614615,
    17707.903526432605,
    17843.43557739624,
    17980.004958205896,
    18117.61960833568,
    18256.287528026533,
    18396.016778751324,
    18536.815483683502,
    18678.69182816934,
    18821.654060203786,
    18965.710490909976,
    19110.869495022387,
    19257.1395113737,
    19404.529043385406,
    19553.046659562147,
    19702.700993989845,
    19853.500746837646,
    20005.454684863707,
    20158.57164192485,
    20312.860519490125,
    20468.33028715829,
    20624.989983179265,
    20782.84871497957,
    20941.915659691775,
    21102.20006468804,
    21263.71124811769,
    21426.458599448924,
    21590.45158001469,
    21755.699723562713,
    21922.21263680973,
]);

HTMLElement.prototype.wrap = function (parent_tag) {
    let p = document.createElement(parent_tag);
    p.appendChild(this);
    return p;
};

export function numeric(container, options) {
    var params = options || {};
    params.type = "numeric";
    slider(container, params);
}

export function slider(container, options) {
    var params = options || {};
    var input = document.createElement("input");
    input.min =
        (params.min !== null && params.min) || (params.prop && params.prop.minValue) || "-12";
    input.max =
        (params.max !== null && params.max) || (params.prop && params.prop.maxValue) || "12";
    input.type = params.type || "range";
    input.defaultValue = (params.prop && params.prop.value.toString()) || params.value;
    input.step = params.step || "0.1";
    var label = document.createElement("span");

    if (input.type == "range") {
        label.innerHTML =
            params.label || (params.prop && params.prop.value.toString()) || params.value;
    } else {
        input.size = "10";
    }
    if (options.oninput) {
        input.oninput = options.oninput;
    } else {
        input.oninput = (e) => {
            params.prop.setValueAtTime(e.target.value, 0);
            label.innerHTML = e.target.value;
        };
    }
    if (options.eventEmitter) {
        options.eventEmitter();
    }
    var contain = document.createElement(params.wrapper || "td");
    contain.style.position = "relative";
    label.style.minWidth = "4em";
    if (params.name) {
        contain.append(el("span", params.name));
    }
    if (params.className) {
        input.className = params.className;
    }
    contain.append(input);
    contain.append(label);

    if (!container) {
        return contain;
    } else container.append(contain);
    return input;
}
export function el(tag, innerHTML) {
    var t = document.createElement(tag);
    t.innerHTML = innerHTML;
    return t;
}

export function selector(container, params) {
    var input = document.createElement("select");

    input.value = params.prop;

    for (const option of params.options) {
        var elem = document.createElement("option");
        elem.innerHTML = option;
        elem.value = option;
        if (params.prop && params.prop === option) {
            elem.selected = "selected";
        }
        input.appendChild(elem);
    }
    container.append(input.wrap("td"));
}
export function histogram2(elemId, analyzer) {
    var gctx = window.g_audioCtx;
    var bins = analyzer.frequencyBinCount;
    var zoomScale = 1;
    var canvas = document.getElementById(elemId);
    const width = 690;
    const height = 320;

    const marginleftright = 10;
    const hz_20_mark = 10;
    const hz_20k_mark = 683;

    canvas.setAttribute("width", width + 2 * marginleftright);
    canvas.setAttribute("height", height);

    const bg_color = "rgb(33,33,35)";
    const cvt = canvas.getContext("2d");
    cvt.fillStyle = bg_color;
    cvt.fillRect(10, 0, width, height);
    cvt.strokeStyle = "rgb(255, 255,255)";
    cvt.strokeWidth = "2px";

    const noctaves = 11;
    var map = [];

    var dataArray = new Uint8Array(analyzer.fftSize);

    const drawTick = function (x, f, meta) {
        cvt.strokeStyle = "rgb(255, 255,255)";
        cvt.moveTo(x, 30);
        cvt.lineTo(x, height);
        cvt.stroke();

        cvt.textAlign = "center";
        cvt.strokeText(f.toFixed(0) + "Hz", x, 20);
        cvt.strokeText(meta, width - 20, 20);
    };

    const bin_number_to_freq = (i) => (0.5 * gctx.sampleRate * i) / analyzer.frequencyBinCount;
    //HZ_LIST
    function drawBars() {
        window.g_request_timer = requestAnimationFrame(drawBars);

        analyzer.getByteFrequencyData(dataArray);

        cvt.clearRect(0, 0, width, height);
        var x = 0;
        var hz_mark_index = 0;
        var linerBarWidth = width / bins;

        for (var i = 0; i < bins; i++) {
            var f = bin_number_to_freq(i);
            if (f >= HZ_LIST[hz_mark_index]) {
                hz_mark_index++;
                if (hz_mark_index >= HZ_LIST.length) break;
                drawTick(x, HZ_LIST[hz_mark_index], "");
            }
            var barWidth =
                hz_mark_index < 5
                    ? 10 * linerBarWidth
                    : hz_mark_index < 7
                    ? 5 * linerBarWidth
                    : linerBarWidth / 2;
            var barHeight = dataArray[i] * zoomScale;

            cvt.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";

            cvt.fillRect(x, height - barHeight / 2 - 25, barWidth, barHeight / 2);
            x += barWidth;
        }
    }

    drawBars();
}

export function writeWave(interleaved) {
    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, "WAVE");

    // FMT sub-chunk
    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
    view.setUint32(24, sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample

    // data sub-chunk
    writeUTFBytes(view, 36, "data");
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var index = 44;
    var volume = 1;
    for (var i = 0; i < interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
        index += 2;
    }

    // our final blob
    var blob = new Blob([view], {type: "audio/wav"});
    return URL.createObjectURL(blob);
}

window.timeseries_static = function (params) {
    var params = Object.assign({sampleSize: 1024, width: 1222, height: 255}, params);
    const {elemId, sampleSize, width, height, analyzer} = params;
    const HEIGHT = height;
    const WIDTH = width;
    var canvas = document.getElementById(elemId);
    const canvasCtx = canvas.getContext("2d");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);

    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = "rgb(122, 122, 122)";
    var dataArray = new Uint8Array(analyzer.fftSize);
    var convertY = (y) => height / 2 - (y - 127) / 2;

    canvasCtx.fillStyle = "gray";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.beginPath();
    canvasCtx.moveTo(0, convertY(0));
    var t = 0;
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    var x = 0;
    function draw() {
        analyzer.getByteTimeDomainData(dataArray);
        var bufferLength = dataArray.length;

        canvasCtx.beginPath();

        // console.log(dataArray);

        for (var i = 0; i < bufferLength; i++) {
            var y = dataArray[i];
            if (y - 127 < 4) continue;
            x = ((t * 40) / bufferLength) % width;
            t++;
            if (t > 11 && x == 0) {
                canvasCtx.stroke();
                canvasCtx.beginPath();
                canvasCtx.moveTo(x, convertY(y));
            } else {
                canvasCtx.lineTo(x, convertY(y));
            }
        }
        canvasCtx.stroke();
        requestAnimationFrame(draw);
    }
    draw();
};
