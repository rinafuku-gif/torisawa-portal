export type GearStatus = "選定中" | "未発注" | "発注済" | "到着済" | "設置済";
export type GearPriority = "必須" | "推奨" | "あれば◎" | "検討中";

export interface GearItem {
  id: string;
  category: string;
  name: string;
  product: string;
  price: number;
  quantity: number;
  status: GearStatus;
  priority: GearPriority;
  note: string;
  shopUrl?: string;
}

export const gearStatuses: { value: GearStatus; label: string; color: string }[] = [
  { value: "選定中", label: "選定中", color: "bg-purple-100 text-purple-700" },
  { value: "未発注", label: "未発注", color: "bg-stone-100 text-stone-600" },
  { value: "発注済", label: "発注済", color: "bg-amber-100 text-amber-700" },
  { value: "到着済", label: "到着済", color: "bg-sky-100 text-sky-700" },
  { value: "設置済", label: "設置済", color: "bg-emerald-100 text-emerald-700" },
];

export const photoCategories = ["DIY作業", "ギア配置", "内装", "検査", "その他"];

export const defaultGearItems: GearItem[] = [
  // A. 家電（購入済）
  { id: "g1", category: "家電", name: "ドラム式洗濯乾燥機", product: "ニトリ ND100KL1", price: 80910, quantity: 1, status: "到着済", priority: "必須", note: "登山・川遊び後の洗濯需要" },
  { id: "g2", category: "家電", name: "プロジェクター", product: "TCL C1 ポータブル", price: 29500, quantity: 1, status: "到着済", priority: "必須", note: "テレビ代わり" },
  { id: "g3", category: "家電", name: "冷蔵庫", product: "ハイセンス 175L 2ドア", price: 27800, quantity: 1, status: "到着済", priority: "必須", note: "左開き" },
  { id: "g4", category: "家電", name: "電子レンジ", product: "ニトリ BK2G02 17L", price: 8991, quantity: 1, status: "到着済", priority: "必須", note: "" },
  { id: "g5", category: "家電", name: "トースター", product: "ニトリ AC2C01WH", price: 10000, quantity: 1, status: "到着済", priority: "必須", note: "" },
  { id: "g6", category: "家電", name: "ケトル", product: "Epeios 細口ドリップ 0.9L", price: 5799, quantity: 1, status: "到着済", priority: "必須", note: "コーヒー向け" },
  { id: "g7", category: "家電", name: "ドライヤー", product: "ニトリ NL101WH", price: 4491, quantity: 2, status: "到着済", priority: "必須", note: "女性客向け" },
  { id: "g8", category: "家電", name: "掃除機", product: "ニトリ コードレス MA201SC", price: 17991, quantity: 1, status: "到着済", priority: "必須", note: "清掃用" },
  // B. 寝具・家具（購入済）
  { id: "g9", category: "寝具・家具", name: "マットレス(S)", product: "ニトリ 圧縮ポケットコイル", price: 9891, quantity: 2, status: "到着済", priority: "必須", note: "" },
  { id: "g10", category: "寝具・家具", name: "マットレス(D)", product: "ニトリ RX05 厚さ20cm", price: 14391, quantity: 1, status: "到着済", priority: "必須", note: "" },
  { id: "g11", category: "寝具・家具", name: "掛け布団(S)", product: "ニトリ 羽毛布団 2枚合わせ", price: 20691, quantity: 2, status: "到着済", priority: "必須", note: "" },
  { id: "g12", category: "寝具・家具", name: "掛け布団(D)", product: "ニトリ 羽毛布団 2枚合わせ", price: 28791, quantity: 1, status: "到着済", priority: "必須", note: "" },
  { id: "g13", category: "寝具・家具", name: "ベッドパッド(S)", product: "ニトリ 除湿・防ダニ", price: 4491, quantity: 2, status: "到着済", priority: "必須", note: "" },
  { id: "g14", category: "寝具・家具", name: "ベッドパッド(D)", product: "ニトリ 除湿・防ダニ", price: 6291, quantity: 1, status: "到着済", priority: "必須", note: "" },
  { id: "g15", category: "寝具・家具", name: "枕", product: "ニトリ ホテルスタイル", price: 2691, quantity: 4, status: "到着済", priority: "必須", note: "" },
  { id: "g16", category: "寝具・家具", name: "パレットベッド", product: "天然木パレット", price: 11155, quantity: 4, status: "到着済", priority: "必須", note: "DIY塗装予定" },
  { id: "g17", category: "寝具・家具", name: "カバーセット(S)", product: "Kumori 3点セット", price: 2261, quantity: 3, status: "到着済", priority: "必須", note: "洗い替え" },
  { id: "g18", category: "寝具・家具", name: "カバーセット(D)", product: "Kumori 4点セット", price: 3401, quantity: 3, status: "到着済", priority: "必須", note: "洗い替え" },
  { id: "g19", category: "寝具・家具", name: "ラックソットマルチ", product: "Snow Peak SET-220", price: 56800, quantity: 1, status: "到着済", priority: "必須", note: "ソファ兼ベッド。中古購入" },
  // C. キャンプギア
  { id: "g20", category: "キャンプギア", name: "ローチェア30", product: "Snow Peak カーキ or ブラウン", price: 18700, quantity: 2, status: "未発注", priority: "必須", note: "室内ソファ兼用。中古想定", shopUrl: "https://www.amazon.co.jp/dp/B0141WGCG8" },
  { id: "g21", category: "キャンプギア", name: "ウッドロールトップテーブル", product: "Hilander 120cm幅", price: 8000, quantity: 1, status: "未発注", priority: "必須", note: "中古想定", shopUrl: "https://www.amazon.co.jp/dp/B0BX52Y53T" },
  { id: "g22", category: "キャンプギア", name: "わがやのシュラフ", product: "DOD ファミリー用・連結可", price: 12816, quantity: 1, status: "未発注", priority: "必須", note: "掛け布団にもなる", shopUrl: "https://www.amazon.co.jp/dp/B08X39WKH9" },
  { id: "g23", category: "キャンプギア", name: "冬用シュラフ 大きめ", product: "KingCamp 封筒型", price: 7890, quantity: 1, status: "未発注", priority: "推奨", note: "外国人ゲスト向け", shopUrl: "https://www.amazon.co.jp/dp/B07HQKVGQF" },
  { id: "g24", category: "キャンプギア", name: "Home&Camp Burner", product: "Snow Peak カセットガス式", price: 12000, quantity: 1, status: "未発注", priority: "必須", note: "安全性◎ 初心者OK", shopUrl: "https://www.amazon.co.jp/dp/B07TS6LMM7" },
  { id: "g25", category: "キャンプギア", name: "チタンポット+メスティン", product: "TOAKS", price: 7000, quantity: 1, status: "未発注", priority: "推奨", note: "「お米を炊く」体験", shopUrl: "https://www.amazon.co.jp/dp/B01B8EZFJW" },
  { id: "g26", category: "キャンプギア", name: "Opinelナイフ #8/#12", product: "フランス製", price: 3500, quantity: 2, status: "未発注", priority: "推奨", note: "キッチン兼用", shopUrl: "https://www.amazon.co.jp/dp/B0054IAGIO" },
  { id: "g27", category: "キャンプギア", name: "チタンダブルウォールマグ300", product: "Snow Peak", price: 4750, quantity: 4, status: "未発注", priority: "必須", note: "保温性◎・84gの軽さ", shopUrl: "https://www.amazon.co.jp/dp/B000AR2OV6" },
  { id: "g28", category: "キャンプギア", name: "ホットサンドメーカー", product: "バウルー ダブル 直火式", price: 4500, quantity: 1, status: "未発注", priority: "推奨", note: "", shopUrl: "https://www.amazon.co.jp/dp/B002017A5A" },
  { id: "g29", category: "キャンプギア", name: "ビーコンライト", product: "Barebones 充電式LED", price: 5500, quantity: 3, status: "未発注", priority: "必須", note: "枕元・ダイニング・玄関", shopUrl: "https://www.amazon.co.jp/dp/B0892LJ676" },
  { id: "g30", category: "キャンプギア", name: "レイルロードランタンLED", product: "Barebones エジソン電球", price: 9000, quantity: 1, status: "未発注", priority: "必須", note: "メイン照明", shopUrl: "https://www.amazon.co.jp/dp/B09QQBT5TC" },
  { id: "g31", category: "キャンプギア", name: "手挽きミル", product: "Porlex ミニ II", price: 7000, quantity: 1, status: "未発注", priority: "推奨", note: "三十日珈琲の豆と一緒に", shopUrl: "https://www.amazon.co.jp/dp/B082L26FLX" },
  { id: "g32", category: "キャンプギア", name: "ドリッパー+サーバー", product: "KINTO SCS 2cups", price: 3000, quantity: 1, status: "未発注", priority: "推奨", note: "", shopUrl: "https://www.amazon.co.jp/dp/B00NFBMA7W" },
  { id: "g33", category: "キャンプギア", name: "アウトドアワゴン", product: "WAQ 150kg耐荷重", price: 10000, quantity: 1, status: "未発注", priority: "必須", note: "中古想定", shopUrl: "https://item.rakuten.co.jp/waqoutdoor/waq-w1/" },
  { id: "g34", category: "キャンプギア", name: "レバー式GIコット", product: "Hilander", price: 8000, quantity: 1, status: "未発注", priority: "推奨", note: "中古想定", shopUrl: "https://www.naturum.co.jp/product/?itemcd=7000060" },
  { id: "g35", category: "キャンプギア", name: "ランドネストドーム", product: "Snow Peak", price: 29800, quantity: 1, status: "未発注", priority: "推奨", note: "庭で試し張り用", shopUrl: "https://www.amazon.co.jp/dp/B0FMDQDZ9X" },
  { id: "g36", category: "キャンプギア", name: "ティピーテント", product: "NINEHILLS 室内用", price: 8920, quantity: 1, status: "未発注", priority: "推奨", note: "写真映え", shopUrl: "https://www.amazon.co.jp/dp/B091PVF1QN" },
  { id: "g37", category: "キャンプギア", name: "LEDストリングライト", product: "電球色・屋内外兼用 11.5m", price: 2000, quantity: 1, status: "未発注", priority: "必須", note: "コスパ最強", shopUrl: "https://www.amazon.co.jp/dp/B083Q2Z12N" },
  { id: "g38", category: "キャンプギア", name: "ファイアグリル", product: "ユニフレーム 683040", price: 7500, quantity: 1, status: "未発注", priority: "必須", note: "BBQ・焚き火・調理兼用", shopUrl: "https://www.amazon.co.jp/dp/B000AR5Y90" },
  { id: "g39", category: "キャンプギア", name: "自立式ハンモック", product: "Vivere ダブル", price: 10000, quantity: 1, status: "未発注", priority: "推奨", note: "フォトスポット", shopUrl: "https://www.amazon.co.jp/dp/B01D8CQ3FM" },
  { id: "g40", category: "キャンプギア", name: "Bluetoothスピーカー", product: "JBL GO 4 IP67防水", price: 5000, quantity: 1, status: "未発注", priority: "推奨", note: "BGMで空間の質UP", shopUrl: "https://www.amazon.co.jp/dp/B0CZDCWM48" },
  { id: "g41", category: "キャンプギア", name: "ボードゲーム", product: "ナンジャモンジャ・ミドリ", price: 2000, quantity: 3, status: "未発注", priority: "推奨", note: "カップル・雨天時", shopUrl: "https://www.amazon.co.jp/dp/B01B7QQCIY" },
  { id: "g42", category: "キャンプギア", name: "コンパクトロッド+仕掛け", product: "入門用セット リール付", price: 5000, quantity: 1, status: "未発注", priority: "あれば◎", note: "川釣り体験", shopUrl: "https://www.amazon.co.jp/dp/B073ZY4VCS" },
  { id: "g43", category: "キャンプギア", name: "アウトドア書籍", product: "5〜10冊", price: 2000, quantity: 7, status: "未発注", priority: "あれば◎", note: "読書スペース充実" },
  // D. DIY・内装
  { id: "g44", category: "DIY・内装", name: "有孔ボード・フック", product: "ラワン有孔ボード 900x600mm", price: 30000, quantity: 1, status: "未発注", priority: "必須", note: "見せる収納", shopUrl: "https://www.amazon.co.jp/dp/B01M8IO3LI" },
  { id: "g45", category: "DIY・内装", name: "照明器具", product: "ライティングレール＋スポット", price: 80000, quantity: 1, status: "未発注", priority: "必須", note: "電気工事込" },
  { id: "g46", category: "DIY・内装", name: "塗装・補修材", product: "ワトコオイル ナチュラル", price: 20000, quantity: 1, status: "未発注", priority: "推奨", note: "柱・棚の着色", shopUrl: "https://www.amazon.co.jp/dp/B00GWBQSW0" },
  { id: "g47", category: "DIY・内装", name: "棚・木材", product: "2×4材・集成材", price: 25000, quantity: 1, status: "未発注", priority: "推奨", note: "キッチン・洗面所" },
  { id: "g48", category: "DIY・内装", name: "ラグ", product: "イグサ or リネン素材", price: 10000, quantity: 1, status: "未発注", priority: "推奨", note: "リビング・質感向上" },
  // E. 備品
  { id: "g49", category: "備品", name: "アメニティボトル", product: "ディスペンサー3本セット 1000ml", price: 5000, quantity: 1, status: "未発注", priority: "必須", note: "", shopUrl: "https://www.amazon.co.jp/dp/B09J8FFY8G" },
  { id: "g50", category: "備品", name: "キッチンツール一式", product: "調理器具10点セット KC-10", price: 15000, quantity: 1, status: "未発注", priority: "必須", note: "", shopUrl: "https://www.amazon.co.jp/dp/B0FT7RZS7Y" },
  { id: "g51", category: "備品", name: "フライパンセット", product: "ニトリ TORERU 6点", price: 8000, quantity: 1, status: "未発注", priority: "必須", note: "省スペース", shopUrl: "https://www.nitori-net.jp/ec/product/8940821s/" },
  { id: "g52", category: "備品", name: "バスタオル", product: "IKEA VAGSJOEN ダークグレー", price: 700, quantity: 15, status: "未発注", priority: "必須", note: "1.5回転分+予備", shopUrl: "https://www.ikea.com/jp/ja/p/vagsjoen-bath-towel-dark-grey-10353609/" },
  { id: "g53", category: "備品", name: "フェイスタオル", product: "IKEA VAGSJOEN ダークグレー", price: 300, quantity: 15, status: "未発注", priority: "必須", note: "1.5回転分+予備", shopUrl: "https://www.ikea.com/jp/ja/p/vagsjoen-hand-towel-dark-grey-80353620/" },
  { id: "g54", category: "備品", name: "食器(皿・ボウル)", product: "IKEA FARGKLAR 10点セット マットグリーン", price: 350, quantity: 30, status: "未発注", priority: "必須", note: "割れ予備含む", shopUrl: "https://www.ikea.com/jp/ja/p/faergklar-10-piece-service-matt-green-00572438/" },
  { id: "g55", category: "備品", name: "カトラリー・箸", product: "IKEA MOPSIG 16点セット", price: 1000, quantity: 4, status: "未発注", priority: "必須", note: "", shopUrl: "https://www.ikea.com/jp/ja/p/mopsig-16-piece-cutlery-set-80343004/" },
  { id: "g56", category: "備品", name: "ゴミ箱(分別)", product: "IKEA DIMPA 3個セット", price: 3000, quantity: 1, status: "未発注", priority: "必須", note: "燃える・ビンカン・ペット", shopUrl: "https://www.ikea.com/jp/ja/p/dimpa-waste-sorting-bag-white-dark-grey-light-grey-30503863/" },
  { id: "g57", category: "備品", name: "スリッパ", product: "ニトリ 拭けるスリッパ", price: 600, quantity: 8, status: "未発注", priority: "必須", note: "ビニールレザー", shopUrl: "https://www.nitori-net.jp/ec/product/7822647s/" },
  { id: "g58", category: "備品", name: "充電ケーブル", product: "Anker PowerLine II 3-in-1", price: 2000, quantity: 2, status: "未発注", priority: "推奨", note: "忘れ物対策", shopUrl: "https://www.amazon.co.jp/dp/B071WNQYV6" },
  { id: "g59", category: "備品", name: "ハンガー", product: "ニトリ すべりにくいアーチ型 10本組", price: 300, quantity: 50, status: "未発注", priority: "推奨", note: "冬場アウター対応", shopUrl: "https://www.nitori-net.jp/ec/product/8470628s/" },
  // F. 防災設備
  { id: "g60", category: "防災設備", name: "消火器", product: "ABC粉末消火器 10型", price: 5000, quantity: 1, status: "未発注", priority: "必須", note: "★保健所検査必須。キッチン付近に設置", shopUrl: "https://www.amazon.co.jp/dp/B00AA8GWLY" },
  { id: "g61", category: "防災設備", name: "誘導灯", product: "設置済み", price: 0, quantity: 1, status: "設置済", priority: "必須", note: "既存設備" },
  { id: "g62", category: "防災設備", name: "火災報知器（煙感知式）", product: "設置済み", price: 0, quantity: 1, status: "設置済", priority: "必須", note: "既存設備。各居室・階段に設置確認済み" },
];
